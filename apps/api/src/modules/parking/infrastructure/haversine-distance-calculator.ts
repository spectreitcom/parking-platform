import { Injectable } from '@nestjs/common';
import { DistanceCalculator } from '../application/ports/distance-calculator';

@Injectable()
export class HaversineDistanceCalculator implements DistanceCalculator {
  calculate(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km

    const phi1 = this.toRad(lat1);
    const phi2 = this.toRad(lat2);
    const deltaPhi = this.toRad(lat2 - lat1);
    const deltaLambda = this.toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // km
  }

  private toRad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
