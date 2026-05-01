import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingSession } from './TrainingSession';
import { CourtZone } from '../types';

@Entity('shots')
export class Shot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TrainingSession, session => session.shots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: TrainingSession;

  @Column({ type: 'integer', nullable: false })
  shot_number!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  landing_position_x?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  landing_position_y?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  target_position_x?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  target_position_y?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  accuracy_cm?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;  // Shot score 0-100, derived from accuracy_cm

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  velocity_kmh?: number;

  @Column({ type: 'integer', nullable: true })
  flight_time_ms?: number;

  @Column({ type: 'varchar', nullable: true })
  court_zone?: CourtZone;

  @Column({ type: 'decimal', precision: 4, scale: 3, nullable: true })
  detection_confidence?: number;

  @Column({ type: 'boolean', nullable: true })
  in_box?: boolean;  // Was landing inside target box?

  @Column({ type: 'integer', nullable: true })
  target_position_index?: number;  // Which position in cycle (0, 1, 2...)

  @CreateDateColumn()
  created_at!: Date;
}

