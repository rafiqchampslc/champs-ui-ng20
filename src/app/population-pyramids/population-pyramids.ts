import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Location } from '@angular/common';
import {
  Report,
  PopulationPyramidAllYearsRow
} from '../service/report'


interface PyramidChart {
  year: number;
  data: ChartConfiguration['data'];
  options: ChartConfiguration['options'];
  hhSize: number;
}
@Component({
  selector: 'app-population-pyramids',
  standalone: false,
  templateUrl: './population-pyramids.html',
  styleUrl: './population-pyramids.css',
})
export class PopulationPyramids implements OnInit {
  siteId!: number;
  pyramids: PyramidChart[] = [];

  private ageOrder = [
    '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
    '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
  ];

  constructor(
    private route: ActivatedRoute,
    private reportService: Report,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.siteId = Number(this.route.snapshot.queryParamMap.get('siteId') || 0);
    if (!this.siteId) { return; }

    this.reportService.getPopulationPyramidsAllYears(this.siteId)
      .subscribe(rows => this.buildPyramids(rows));
  }

  goBack() {
  this.location.back();
}
  private buildPyramids(rows: PopulationPyramidAllYearsRow[]) {
    // group by year
    const map = new Map<number, PopulationPyramidAllYearsRow[]>();
    for (const r of rows) {
      if (!map.has(r.dataYear)) map.set(r.dataYear, []);
      map.get(r.dataYear)!.push(r);
    }
    debugger;
    //const years = Array.from(map.keys()).sort((a, b) => a - b);
      const years = Array.from(map.keys());

    this.pyramids = years.map(year => {
      const yearRows = map.get(year)!;

      // map age -> {male,female}
      const byAge: Record<string, { male: number; female: number }> = {};
      for (const r of yearRows) {
        byAge[r.ageGroupLabel] = {
          male: Number(r.maleCount),
          female: Number(r.femaleCount)
        };
      }

      const labels = this.ageOrder; // youngest first; we’ll reverse Y-axis

      const maleData = labels.map(l => -(byAge[l]?.male || 0));
      const femaleData = labels.map(l => +(byAge[l]?.female || 0));

      const data: ChartConfiguration['data'] = {
        labels,
        datasets: [
          {
            label: 'Male',
            data: maleData,
            backgroundColor: '#60a5fa'
          },
          {
            label: 'Female',
            data: femaleData,
            backgroundColor: '#fb7185'
          }
        ]
      };

      const options: ChartConfiguration['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        // Make bars occupy full category space (no gaps)
        datasets: {
          bar: {
            barPercentage: .93,
            categoryPercentage: 1.0,
            maxBarThickness: 40
          }
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => {
                const value = Math.abs(Number(ctx.raw || 0));
                return `${ctx.dataset.label}: ${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: (val: any) => {
                const num = Math.abs(Number(val));
                return num.toLocaleString();
              }
            }
          },
          y: {
            stacked: true,
            reverse: true    // youngest at bottom
          }
        }
      };
debugger;
      return { year, data, options, hhSize: yearRows[0].hhSize};
    });
  }
}