import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Olympic } from '../../core/models/Olympic';
import { OlympicService } from '../../core/services/olympic.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StatComponent } from '../../components/stat/stat.component';

interface ChartEvent {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  series: { name: string; value: number }[];
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxChartsModule, StatComponent],
})
export class DetailComponent implements OnInit, OnDestroy {
  countryName: string = '';
  chartData: LineChartData[] = [];

  // Options du graphique
  view: [number, number] = [700, 400];
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Dates';
  yAxisLabel: string = '';
  timeline: boolean = false;

  numberOfEntries: number = 0;
  totalMedals: number = 0;
  totalAthletes: number = 0;

  private destroy$ = new Subject<void>();
  olympics$: Observable<Olympic[] | null>;

  constructor(
    private olympicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.olympics$ = this.olympicService.getOlympics();
  }

  ngOnInit(): void {
    const countryId = this.route.snapshot.paramMap.get('id');

    this.olympics$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        const country = data.find((c) => c.id === Number(countryId));
        if (!country) {
          this.router.navigate(['/not-found']);
          return;
        }

        this.countryName = country.country;
        this.numberOfEntries = country.participations.length;
        this.totalMedals = country.participations.reduce(
          (acc, curr) => acc + curr.medalsCount,
          0
        );
        this.totalAthletes = country.participations.reduce(
          (acc, curr) => acc + curr.athleteCount,
          0
        );

        this.chartData = [
          {
            name: country.country,
            series: country.participations.map((p) => ({
              name: p.year.toString(),
              value: p.medalsCount,
            })),
          },
        ];
      }
    });

    this.setChartDimensions();
    window.addEventListener('resize', () => this.setChartDimensions());
  }

  private setChartDimensions(): void {
    const width = window.innerWidth;
    if (width <= 768) {
      this.view = [width - 50, 300];
    } else {
      this.view = [700, 400];
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.setChartDimensions());
  }
}
