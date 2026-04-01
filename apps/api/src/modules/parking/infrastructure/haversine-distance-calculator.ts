import { Injectable } from '@nestjs/common';
import { DistanceCalculator } from 'src/modules/parking/application/ports/distance-calculator';

@Injectable()
export class HaversineDistanceCalculator implements DistanceCalculator {
  calculate(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): Promise<number> | number {
    const R = 6371; // km

    const φ1 = this.toRad(lat1);
    const φ2 = this.toRad(lat2);
    const Δφ = this.toRad(lat2 - lat1);
    const Δλ = this.toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // km
  }

  private toRad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
