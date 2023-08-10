import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const session = await this.reservationsRepository.startTransaction();
    try {
      const reservation = await this.reservationsRepository.create(
        {
          ...createReservationDto,
          timestamp: new Date(),
          userId: '123',
        },
        { session },
      );
      // TODO Add RabbitMQ
      await session.commitTransaction();

      return reservation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }

  findAll() {
    return this.reservationsRepository.find({});
  }

  findOne(_id: string) {
    return this.reservationsRepository.findOne({ _id });
  }

  update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  remove(_id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id });
  }
}
