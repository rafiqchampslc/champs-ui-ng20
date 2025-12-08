import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Report, Under5ChildPyramidRow } from '../service/report';
import { Location } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexTooltip,
  ApexDataLabels
} from 'ng-apexcharts';

export type Under5PyramidChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  colors: string[];
};

interface Under5PyramidChart {
  year: number;
  options: Under5PyramidChartOptions;
}
@Component({
  selector: 'app-under5-pyramids',
  standalone: false,
  templateUrl: './under5-pyramids.html',
  styleUrl: './under5-pyramids.css',
})
export class Under5Pyramids implements OnInit {
 siteId!: number;
  pyramids: Under5PyramidChart[] = [];

  private ageLabels = ['< 1', '1 - < 2', '2 - < 3', '3 - < 4', '4 - < 5'];

  constructor(
    private route: ActivatedRoute,
    private reportService: Report,
     private location: Location
  ) {}

  ngOnInit(): void {
    debugger;
    this.siteId = Number(this.route.snapshot.queryParamMap.get('siteId') || 0);
    if (!this.siteId) return;

    this.reportService
      .getUnder5ChildPyramidsAllYears(this.siteId)
      .subscribe(rows => this.buildCharts(rows));
  }

   goBack() {
  this.location.back();
}

  private buildCharts(rows: Under5ChildPyramidRow[]) {
    const map = new Map<number, Under5ChildPyramidRow[]>();
    for (const r of rows) {
      if (!map.has(r.dataYear)) map.set(r.dataYear, []);
      map.get(r.dataYear)!.push(r);
    }

    //const years = Array.from(map.keys()).sort((a, b) => a - b);
    const years = Array.from(map.keys());


    this.pyramids = years.map(year => {
      const yearRows = map.get(year)!;

      const byAge: Record<string, { male: number; female: number }> = {};
      for (const r of yearRows) {
        byAge[r.ageGroupLabel] = {
          male: Number(r.maleCount),
          female: Number(r.femaleCount)
        };
      }

      // We want youngest at bottom -> reverse the display order
      const ordered = this.ageLabels;              // logical order
      const displayLabels = [...ordered].reverse(); // for y-axis top->bottom

      const male = ordered.map(l => byAge[l]?.male || 0);
      const female = ordered.map(l => byAge[l]?.female || 0);

      const maleData = male.slice().reverse().map(v => -v); // left side
      const femaleData = female.slice().reverse();          // right side

      const options: Under5PyramidChartOptions = {
  series: [
    { name: 'Male', data: maleData },
    { name: 'Female', data: femaleData }
  ],
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%'
    }
  },
  xaxis: {
    // ✅ categories must be on xaxis (for horizontal bar Apex will show them on Y)
    categories: displayLabels,
    title: { text: 'Number of children (0–4 years)' },
    labels: {
      formatter: (val: number | string) => Math.abs(Number(val)).toLocaleString()
    }
  },
  yaxis: {
    title: { text: 'Age group (years)' },
    // optional: make youngest at bottom
    reversed: true
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => Math.abs(val).toLocaleString()
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => Math.abs(val).toLocaleString(),
    style: {
      fontSize: '10px',
      fontWeight: 'bold'
    }
  },
  colors: ['#60A5FA', '#FB7185'] // male, female
};


      return { year, options };
    });
  }
}
