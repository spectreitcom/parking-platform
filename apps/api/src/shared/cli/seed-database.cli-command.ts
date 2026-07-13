import { Command, CommandRunner, Option } from 'nest-commander';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { fakerPL as faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

interface Options {
  amount?: number;
}

@Command({
  name: 'seed',
  description: 'Seed database with large amount of data',
})
export class SeedDatabaseCliCommand extends CommandRunner {
  private readonly logger = new Logger(SeedDatabaseCliCommand.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async run(passedParams: string[], options?: Options): Promise<void> {
    const amount = options?.amount ?? 100;
    this.logger.log(
      `Rozpoczynam seedowanie bazy danych (ilość bazowa: ${amount})...`,
    );

    try {
      await this.seedPlaceTypes();
      await this.seedParkingFeatures();
      await this.seedParkingAddons();

      const organizationIds = await this.seedOrganizations(
        Math.max(1, Math.floor(amount / 10)),
      );
      const places = await this.seedPlaces(amount);

      const parkingIds = await this.seedParkings(
        amount,
        organizationIds,
        places,
      );
      await this.seedParkingSpots(parkingIds);

      this.logger.log('Seedowanie zakończone sukcesem!');

      process.exit(0);
    } catch (error) {
      this.logger.error('Błąd podczas seedowania:', error);
      process.exit(1);
    }
  }

  @Option({
    flags: '-a, --amount <number>',
    description: 'Podstawowa ilość danych do wygenerowania (domyślnie: 100)',
  })
  parseAmount(val: string): number {
    return Number(val);
  }

  private async seedPlaceTypes() {
    this.logger.log('Seedowanie typów miejsc...');
    const types = [
      { name: 'Lotnisko' },
      { name: 'Centrum handlowe' },
      { name: 'Biurowiec' },
      { name: 'Centrum miasta' },
      { name: 'Dworzec kolejowy' },
      { name: 'Szpital' },
    ];

    for (const type of types) {
      const created = await this.prisma.placeType.upsert({
        where: { name: type.name },
        update: {},
        create: {
          name: type.name,
          version: 1,
        },
      });

      await this.prisma.placeTypeRead.upsert({
        where: { placeTypeId: created.id },
        update: {},
        create: {
          placeTypeId: created.id,
          name: created.name,
          version: created.version,
        },
      });
    }
  }

  private async seedParkingFeatures() {
    this.logger.log('Seedowanie udogodnień parkingu...');
    const features = [
      { name: 'Monitoring CCTV', levels: ['PARKING', 'SPOT'] },
      { name: 'Zadaszony', levels: ['PARKING'] },
      { name: 'Ładowarka EV', levels: ['SPOT'] },
      { name: 'Dostęp dla niepełnosprawnych', levels: ['PARKING', 'SPOT'] },
      { name: 'Ochrona 24/7', levels: ['PARKING'] },
      { name: 'Płatność kartą', levels: ['PARKING'] },
    ];

    for (const feature of features) {
      const created = await this.prisma.parkingFeature.upsert({
        where: { name: feature.name },
        update: {},
        create: {
          name: feature.name,
          levels: feature.levels,
          version: 1,
        },
      });

      await this.prisma.parkingFeatureRead.upsert({
        where: { parkingFeatureId: created.id },
        update: {},
        create: {
          parkingFeatureId: created.id,
          name: created.name,
          levels: created.levels,
          version: created.version,
        },
      });
    }
  }

  private async seedParkingAddons() {
    this.logger.log('Seedowanie dodatków parkingowych...');
    const addons = [
      { name: 'Myjnia ręczna', code: 'CAR_WASH', price: 5000 },
      { name: 'Ubezpieczenie Premium', code: 'INSURANCE', price: 2000 },
      { name: 'Odkurzanie wnętrza', code: 'VACUUMING', price: 3000 },
      { name: 'Tankowanie', code: 'REFUELING', price: 1500 },
    ];

    for (const addon of addons) {
      const created = await this.prisma.parkingAddon.upsert({
        where: { code: addon.code },
        update: {},
        create: {
          name: addon.name,
          code: addon.code,
          price: addon.price,
          version: 1,
        },
      });

      await this.prisma.parkingAddonRead.upsert({
        where: { parkingAddonId: created.id },
        update: {},
        create: {
          parkingAddonId: created.id,
          name: created.name,
          code: created.code,
          price: created.price,
          priceInPln: new Prisma.Decimal(created.price / 100),
          version: created.version,
        },
      });
    }
  }

  private async seedOrganizations(count: number): Promise<string[]> {
    this.logger.log(`Seedowanie ${count} organizacji...`);
    const ids: string[] = [];
    const passwordHash = await argon2.hash('123456');

    const existingOrgs = await this.prisma.organization.findMany({
      select: { name: true },
    });
    const usedNames = new Set(existingOrgs.map((o) => o.name));

    const existingUsers = await this.prisma.organizationUser.findMany({
      select: { email: true },
    });
    const usedEmails = new Set(existingUsers.map((u) => u.email));

    for (let i = 0; i < count; i++) {
      let name = faker.company.name();
      while (usedNames.has(name)) {
        name = `${faker.company.name()} ${faker.string.alphanumeric(3)}`;
      }
      usedNames.add(name);

      const org = await this.prisma.organization.create({
        data: {
          name,
          address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
          taxId: faker.string.numeric(10),
          version: 1,
        },
      });

      ids.push(org.id);

      await this.prisma.parkingOrganization.create({
        data: {
          organizationId: org.id,
          name: org.name,
          address: org.address,
        },
      });

      await this.prisma.organizationListForAdminRead.create({
        data: {
          organizationId: org.id,
          name: org.name,
          address: org.address,
          taxId: org.taxId,
          members: [],
          version: 1,
        },
      });

      // Seed organization user
      let email = faker.internet.email({ provider: 'example.com' });
      while (usedEmails.has(email)) {
        email = faker.internet.email({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName() + faker.string.alphanumeric(3),
          provider: 'example.com',
        });
      }
      usedEmails.add(email);

      const user = await this.prisma.organizationUser.create({
        data: {
          email,
          displayName: faker.person.fullName(),
          status: 'ACTIVE',
          passwordHash,
          version: 1,
        },
      });

      await this.prisma.organizationMember.create({
        data: {
          organizationId: org.id,
          organizationUserId: user.id,
          isRoot: true,
        },
      });

      await this.prisma.organizationOrganizationUser.create({
        data: {
          organizationUserId: user.id,
          displayName: user.displayName,
          email: user.email,
        },
      });

      await this.prisma.organizationUserRead.create({
        data: {
          organizationUserId: user.id,
          email: user.email,
          displayName: user.displayName,
          statusText: 'Aktywny',
        },
      });
    }

    return ids;
  }

  private async seedPlaces(
    count: number,
  ): Promise<{ id: string; name: string }[]> {
    this.logger.log(`Seedowanie ${count} miejsc (Place)...`);
    const placeTypes = await this.prisma.placeType.findMany();

    const existingPlaces = await this.prisma.place.findMany({
      select: { name: true },
    });
    const usedNames = new Set(existingPlaces.map((p) => p.name));

    const ids: { id: string; name: string }[] = [];

    const data: Prisma.PlaceCreateManyInput[] = [];
    const readData: Prisma.PlaceReadCreateManyInput[] = [];

    for (let i = 0; i < count; i++) {
      const type = faker.helpers.arrayElement(placeTypes);
      const city = faker.location.city();
      let name = this.getRealisticPlaceName(type.name, city);

      if (usedNames.has(name)) {
        name = `${name} ${faker.string.alphanumeric(5)}`;
      }

      while (usedNames.has(name)) {
        name = `${name}-${faker.string.alphanumeric(3)}`;
      }
      usedNames.add(name);

      const id = faker.string.uuid();
      const lat = faker.location.latitude({ min: 49, max: 54 });
      const lng = faker.location.longitude({ min: 14, max: 24 });
      const address = `${faker.location.streetAddress()}, ${city}`;

      data.push({
        id,
        name,
        latitude: lat,
        longitude: lng,
        address,
        placeTypeId: type.id,
        active: true,
        version: 1,
      });

      readData.push({
        placeId: id,
        name,
        latitude: lat,
        longitude: lng,
        address,
        placeTypeId: type.id,
        placeTypeName: type.name,
        active: true,
        version: 1,
      });

      ids.push({ id, name });
    }

    if (data.length > 0) {
      await this.prisma.place.createMany({ data });
      await this.prisma.placeRead.createMany({ data: readData });
    }

    return ids;
  }

  private getRealisticPlaceName(type: string, city: string): string {
    switch (type) {
      case 'Lotnisko':
        return faker.helpers.arrayElement([
          `Lotnisko Chopina`,
          `Port Lotniczy ${city}`,
          `Lotnisko ${city}-${faker.location.city()}`,
          `Międzynarodowy Port Lotniczy im. ${faker.person.fullName()}`,
          `Aeroklub ${city}`,
        ]);
      case 'Centrum handlowe':
        return faker.helpers.arrayElement([
          `Galeria ${city}`,
          `Centrum Handlowe ${faker.company.name()}`,
          `CH ${city} Plaza`,
          `Galeria ${faker.helpers.arrayElement([
            'Krakowska',
            'Bałtycka',
            'Dominikańska',
            'Pomorska',
            'Sudecka',
          ])}`,
          `Pasaż ${faker.location.street()}`,
          `Manufaktura`,
          `Silesia City Center`,
        ]);
      case 'Biurowiec':
        return faker.helpers.arrayElement([
          `${city} Business Garden`,
          `Olivia Business Centre`,
          `Biurowiec ${faker.company.name()}`,
          `${faker.company.name()} Tower`,
          `Centrum Biurowe ${faker.location.street()}`,
          `Sky Tower`,
          `Warsaw Spire`,
          `${city} Office Park`,
        ]);
      case 'Centrum miasta':
        return faker.helpers.arrayElement([
          `Rynek Główny w ${city}`,
          `Stare Miasto ${city}`,
          `Plac Wolności ${city}`,
          `Plac Defilad`,
          `Krakowskie Przedmieście`,
          `Centrum ${city}`,
        ]);
      case 'Dworzec':
      case 'Dworzec kolejowy':
        return faker.helpers.arrayElement([
          `Dworzec Główny ${city}`,
          `Stacja Kolejowa ${city} Śródmieście`,
          `PKP ${city} Zachodni`,
          `Dworzec Wschodni`,
          `Dworzec ${city} Miasto`,
        ]);
      case 'Szpital':
        return faker.helpers.arrayElement([
          `Szpital Wojewódzki w ${city}`,
          `Szpital Kliniczny im. ${faker.person.fullName()}`,
          `Centrum Onkologii`,
          `Szpital Bródnowski`,
          `Uniwersyteckie Centrum Kliniczne`,
          `Samodzielny Publiczny Szpital Kliniczny`,
        ]);
      default:
        return faker.helpers.arrayElement([
          `${city} ${faker.company.buzzNoun()}`,
          `${type} ${city}`,
          `${faker.company.name()} ${type}`,
          `Obiekt ${faker.string.alphanumeric(3).toUpperCase()}`,
        ]);
    }
  }

  private async seedParkings(
    count: number,
    organizationIds: string[],
    places: { id: string; name: string }[],
  ): Promise<string[]> {
    this.logger.log(`Seedowanie ${count} parkingów...`);
    const features = await this.prisma.parkingFeature.findMany();
    const addons = await this.prisma.parkingAddon.findMany();

    const existingParkings = await this.prisma.parking.findMany({
      select: { name: true },
    });
    const usedNames = new Set(existingParkings.map((p) => p.name));

    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
      const orgId = faker.helpers.arrayElement(organizationIds);
      const place = faker.helpers.arrayElement(places);
      let name = faker.helpers.arrayElement([
        `Parking przy ${place.name}`,
        `Parking ${place.name}`,
        `Parking Podziemny ${place.name}`,
        `Parking Strzeżony ${faker.location.street()}`,
        `P+R ${place.name.split(' ').pop()}`,
        `Parking ${faker.company.name()}`,
      ]);

      if (usedNames.has(name)) {
        name = `${name} ${faker.string.alphanumeric(3)}`;
      }
      while (usedNames.has(name)) {
        name = `${name}-${faker.string.alphanumeric(2)}`;
      }
      usedNames.add(name);
      const address = faker.location.streetAddress(true);
      const lat = faker.location.latitude({ min: 49, max: 54 });
      const lng = faker.location.longitude({ min: 14, max: 24 });

      const parking = await this.prisma.parking.create({
        data: {
          name,
          address,
          latitude: lat,
          longitude: lng,
          organizationId: orgId,
          placeId: place.id,
          active: true,
          description: faker.lorem.paragraph(),
          statute: 'Regulamin parkingu...',
          version: 1,
          parkingFeatures: {
            connect: faker.helpers
              .arrayElements(features, { min: 1, max: 3 })
              .map((f) => ({ id: f.id })),
          },
          parkingAddons: {
            connect: faker.helpers
              .arrayElements(addons, { min: 1, max: 2 })
              .map((a) => ({ id: a.id })),
          },
        },
        include: {
          parkingFeatures: true,
          parkingAddons: true,
        },
      });

      ids.push(parking.id);

      await this.prisma.parkingRead.create({
        data: {
          parkingId: parking.id,
          name: parking.name,
          address: parking.address,
          latitude: parking.latitude,
          longitude: parking.longitude,
          organizationId: parking.organizationId,
          placeId: parking.placeId,
          active: parking.active,
          description: parking.description,
          statute: parking.statute,
          version: parking.version,
          parkingFeatureIds: parking.parkingFeatures.map((f) => f.id),
          parkingAddonIds: parking.parkingAddons.map((a) => a.id),
          createdAt: parking.createdAt,
          updatedAt: parking.updatedAt,
        },
      });

      // Also seed Search model
      await this.prisma.search.create({
        data: {
          parkingId: parking.id,
          name: parking.name,
          latitude: parking.latitude,
          longitude: parking.longitude,
          placeId: parking.placeId,
          active: parking.active,
          hasAvailableParkingSpots: true,
          features: parking.parkingFeatures.map((f) => ({ name: f.name })),
          featureIds: parking.parkingFeatures.map((f) => f.id),
          addons: parking.parkingAddons.map((a) => ({ name: a.name })),
          addonIds: parking.parkingAddons.map((a) => a.id),
          assetIds: parking.assetIds,
          order: i,
          distance: 0,
        },
      });

      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });
      const placeDetails = await this.prisma.place.findUnique({
        where: { id: place.id },
      });

      await this.prisma.parkingListForAdminRead.create({
        data: {
          parkingId: parking.id,
          organizationId: orgId,
          placeId: place.id,
          parkingName: parking.name,
          parkingAddress: parking.address,
          placeName: placeDetails?.name ?? '',
          parkingActive: parking.active,
          organizationName: org?.name ?? '',
          version: 1,
          parkingSpotsNumber: 0, // Will be updated
        },
      });
    }

    return ids;
  }

  private async seedParkingSpots(parkingIds: string[]) {
    this.logger.log(
      `Seedowanie miejsc parkingowych dla ${parkingIds.length} parkingów...`,
    );
    const features = await this.prisma.parkingFeature.findMany({
      where: { levels: { has: 'SPOT' } },
    });

    for (const parkingId of parkingIds) {
      const spotCount = faker.number.int({ min: 10, max: 50 });
      const parking = await this.prisma.parking.findUnique({
        where: { id: parkingId },
      });

      const spotsData: Prisma.ParkingSpotCreateManyInput[] = [];
      for (let i = 0; i < spotCount; i++) {
        spotsData.push({
          id: faker.string.uuid(),
          parkingId,
          price: faker.number.int({ min: 1000, max: 5000 }),
          active: true,
          version: 1,
        });
      }

      await this.prisma.parkingSpot.createMany({ data: spotsData });

      await this.prisma.parkingListForAdminRead.updateMany({
        where: { parkingId },
        data: { parkingSpotsNumber: spotCount },
      });

      const spotsReadData: Prisma.ParkingSpotReadCreateManyInput[] = [];
      for (const spot of spotsData) {
        const spotFeatures = faker.helpers.arrayElements(features, {
          min: 0,
          max: 2,
        });

        // Connect features via separate updates (hard to optimize M-N createMany in Prisma)
        if (spotFeatures.length > 0) {
          await this.prisma.parkingSpot.update({
            where: { id: spot.id },
            data: {
              parkingSpotFeatures: {
                connect: spotFeatures.map((f) => ({ id: f.id })),
              },
            },
          });
        }

        spotsReadData.push({
          parkingSpotId: spot.id!,
          parkingId: spot.parkingId,
          organizationId: parking!.organizationId,
          price: spot.price,
          pricePLN: spot.price / 100,
          active: spot.active!,
          version: spot.version!,
          parkingSpotFeatureIds: spotFeatures.map((f) => f.id),
        });
      }

      await this.prisma.parkingSpotRead.createMany({ data: spotsReadData });
    }
  }
}
