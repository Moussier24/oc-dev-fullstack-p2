import { Component, OnDestroy, OnInit } from '@angular/core';
import { faMedal } from '@fortawesome/free-solid-svg-icons';
import { LegendPosition } from '@swimlane/ngx-charts';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Olympic } from '../../core/models/Olympic';
import { OlympicService } from '../../core/services/olympic.service';
import { Router } from '@angular/router';

interface ChartData {
  name: string;
  value: number;
}

interface ChartEvent {
  name: string;
  value: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  chartData: ChartData[] = [];

  // Options du graphique
  view: [number, number] = [700, 400];
  gradient = false;
  showLegend = false;
  showLabels = true;
  isDoughnut = false;
  legendPosition: LegendPosition = LegendPosition.Below;

  olympics$: Observable<Olympic[] | null>;
  private destroy$ = new Subject<void>();
  numberOfJOs: number = 0;
  numberOfCountries: number = 0;

  faMedal = faMedal;

  constructor(private olympicService: OlympicService, private router: Router) {
    this.olympics$ = this.olympicService.getOlympics();
  }

  ngOnInit(): void {
    this.olympics$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.chartData = data.map((country) => ({
          name: country.country,
          value: country.participations.reduce(
            (acc, curr) => acc + curr.medalsCount,
            0
          ),
        }));
        this.numberOfJOs = data.length;
        this.numberOfCountries = data.length;
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

  onSelect(event: ChartEvent): void {
    this.olympics$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        const country = data.find((c) => c.country === event.name);
        if (country) {
          this.router.navigate(['/detail', country.id]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.setChartDimensions());
  }
}
