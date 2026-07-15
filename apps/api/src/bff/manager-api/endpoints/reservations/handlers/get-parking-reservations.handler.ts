import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { GetParkingReservationsQueryParamsDto } from '../dto/get-parking-reservations-query-params.dto';
import type { RequestUser } from '../../../auth/types';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';

@Injectable()
export class GetParkingReservationsHandler implements IControllerHandler {
  constructor(
    private readonly parkingFacade: ParkingFacade,
    private readonly reservationFacade: ReservationFacade,
    private readonly userIamFacade: UserIamFacade,
  ) {}

  async handle(
    queryParams: GetParkingReservationsQueryParamsDto,
    managerUser: RequestUser,
  ) {
    const organizationIds = managerUser.organizations.map(
      (org) => org.organizationId,
    );

    const parking = await this.parkingFacade.getParkingById(
      queryParams.parkingId,
    );

    if (!parking) {
      throw new NotFoundException('Parking not found');
    }

    if (!organizationIds.includes(parking.organizationId)) {
      throw new ForbiddenException('Access is forbidden');
    }

    const reservations =
      await this.reservationFacade.getReservationsByParkingId(
        queryParams.parkingId,
        queryParams.page,
        queryParams.limit,
        queryParams.search,
      );

    const users = await this.userIamFacade.getUsersByIds(
      reservations.map((reservation) => reservation.userId),
    );

    const usersMap = new Map(users.map((user) => [user.id, user]));

    const data: (Omit<(typeof reservations)[number], 'userId'> & {
      user: {
        id: string;
        email: string;
        name: string;
      };
    })[] = [];

    for (const reservation of reservations) {
      const user = usersMap.get(reservation.userId)!;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...rest } = reservation;

      data.push({
        ...rest,
        user,
      });
    }

    const total = await this.reservationFacade.getReservationsByParkingIdTotal(
      queryParams.parkingId,
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page,
    };
  }
}
