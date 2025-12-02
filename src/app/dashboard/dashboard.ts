import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import {
  Report,
  SiteDto,
  YearDto,
  HouseholdTrendRow,
  TotalPopulationRow,
  PopulationPyramidRow,
  ChildPyramidRow,
  HouseholdSizeRow,
  MigrationTrendRow
} from '../service/report'
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexGrid
} from 'ng-apexcharts';

export type PopulationSummaryChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
};

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {
  sites: SiteDto[] = [];
  years: YearDto[] = [];
  selectedSiteId: number | null = null;
  selectedYear: number | null = null;

  householdTrendData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  totalPopulationData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  householdSizeData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  migrationTrendData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  pyramidChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Male',
        data: [],        // will be negative
        backgroundColor: '#ff9aa2',
        borderWidth: 1
      },
      {
        label: 'Female',
        data: [],        // positive
        backgroundColor: '#9ad0ff',
        borderWidth: 1
      }
    ]
  };

  pyramidChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',              // horizontal bars
    scales: {
      x: {
        stacked: true,
        ticks: {
          callback: (value) => {
            const num = Number(value);
            return isNaN(num) ? value : Math.abs(num).toLocaleString();   // ✅ show positive
          }
        }
      },
      y: {
        stacked: true
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            // since indexAxis = 'y', x is the value
            const v = context.parsed.x as number;
            return `${label}: ${Math.abs(v).toLocaleString()}`;           // ✅ positive tooltip
          }
        }
      }
    }
  };

    childpyramidChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Male',
        data: [],        // will be negative
        backgroundColor: '#ff9aa2',
        borderWidth: 1
      },
      {
        label: 'Female',
        data: [],        // positive
        backgroundColor: '#9ad0ff',
        borderWidth: 1
      }
    ]
  };

  childpyramidChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',              // horizontal bars
    scales: {
      x: {
        stacked: true,
        ticks: {
          callback: (value) => {
            const num = Number(value);
            return isNaN(num) ? value : Math.abs(num).toLocaleString();   // ✅ show positive
          }
        }
      },
      y: {
        stacked: true
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            // since indexAxis = 'y', x is the value
            const v = context.parsed.x as number;
            return `${label}: ${Math.abs(v).toLocaleString()}`;           // ✅ positive tooltip
          }
        }
      }
    }
  };

  populationSummaryChartOptions: PopulationSummaryChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 550,
      toolbar: { show: true }
    },
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    dataLabels: {
      enabled: true,
      offsetY: -8,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#3c27b3ff']
      },
      background: {
        enabled: true,
        borderRadius: 4,
        padding: 4,
        borderWidth: 0,
        foreColor: '#ffffff',
        opacity: 1
      },
      formatter: (val: any) => {
        // show integers; adjust if you need decimals
        return typeof val === 'number' ? val.toFixed(0) : val;
      }
    },
    stroke: {
      curve: 'straight',              // or 'smooth' if you prefer
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeOpacity: 1
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      shared: true,
      intersect: false
    }
  };



  pyramidLabels: string[] = [];
  pyramidMale: number[] = [];
  pyramidFemale: number[] = [];

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { tooltip: { enabled: true }, legend: { display: true } }
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { tooltip: { enabled: true }, legend: { display: true } }
  };

  constructor(private reportService: Report) { }

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites() {
    this.reportService.getSites().subscribe(sites => {
      this.sites = sites;
      if (sites.length) {
        this.selectedSiteId = sites[0].siteId;
        this.onSiteChange();
      }
    });
  }

  onSiteChange() {
    if (!this.selectedSiteId) return;
    const siteId = this.selectedSiteId;

    this.reportService.getYears(siteId).subscribe(years => {
      this.years = years;
      if (years.length) {
        this.selectedYear = years[years.length - 1].year;
        this.loadAllCharts();
      }
    });
  }

  onYearChange() {
    this.loadPyramid();
    this.loadChildPyramid();
  }

  loadAllCharts() {
    if (!this.selectedSiteId || !this.selectedYear) return;
    this.loadHouseholdTrend();
    this.loadTotalPopulation();
    this.loadPyramid();
    this.loadChildPyramid();
    this.loadHouseholdSize();
    this.loadMigrationTrend();
    this.loadPopulationSummaryTrend();

  }

  loadPopulationSummaryTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getPopulationSummaryTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        this.populationSummaryChartOptions.series = [
          {
            name: 'Total population',
            data: rows.map(r => r.totalPopulation)
          },
          {
            name: 'Reproductive age women (15–49)',
            data: rows.map(r => r.reproductiveAgeWomen)
          },
          {
            name: 'Under 5 children',
            data: rows.map(r => r.under5Children)
          }
        ];

        this.populationSummaryChartOptions.xaxis = {
          categories: years,
          title: { text: 'Year' }
        };

      });
  }


  loadHouseholdTrend() {
    if (!this.selectedSiteId) return;
    this.reportService.getHouseholdTrend(this.selectedSiteId)
      .subscribe((rows: HouseholdTrendRow[]) => {
        const years = Array.from(new Set(rows.map(r => r.dataYear))).sort();
        const codes = Array.from(new Set(rows.map(r => r.indicatorCode)));

        this.householdTrendData.labels = years;

        this.householdTrendData.datasets = codes.map(code => ({
          label: code,
          data: years.map(y => rows.find(r => r.dataYear === y && r.indicatorCode === code)?.value ?? 0),
          fill: false
        }));
      });
  }

  loadTotalPopulation() {
    if (!this.selectedSiteId) return;
    this.reportService.getTotalPopulation(this.selectedSiteId)
      .subscribe((rows: TotalPopulationRow[]) => {
        this.totalPopulationData = {
          labels: rows.map(r => r.dataYear.toString()),
          datasets: [{
            label: 'Total population',
            data: rows.map(r => r.totalPopulation)
          }]
        };
      });
  }


  loadPyramid() {
  if (!this.selectedSiteId || !this.selectedYear) return;

  this.reportService.getPyramid(this.selectedSiteId, this.selectedYear)
    .subscribe((rows: PopulationPyramidRow[]) => {
debugger;
      const labels = rows.map(r => r.ageGroupLabel);
      const male   = rows.map(r => -Number(r.maleCount));    
      const female = rows.map(r =>  Number(r.femaleCount));  

      this.pyramidChartData.labels = labels;
      this.pyramidChartData.datasets[0].data = male;
      this.pyramidChartData.datasets[1].data = female;
    });
}

  loadChildPyramid() {
  if (!this.selectedSiteId || !this.selectedYear) return;

  this.reportService.getChildPyramid(this.selectedSiteId, this.selectedYear)
    .subscribe((rows: ChildPyramidRow[]) => {
debugger;
      const labels = rows.map(r => r.ageGroupLabel);
      const male   = rows.map(r => -Number(r.maleCount));    
      const female = rows.map(r =>  Number(r.femaleCount));  

      this.childpyramidChartData.labels = labels;
      this.childpyramidChartData.datasets[0].data = male;
      this.childpyramidChartData.datasets[1].data = female;
    });
}

  loadHouseholdSize() {
    if (!this.selectedSiteId) return;
    this.reportService.getHouseholdSize(this.selectedSiteId)
      .subscribe((rows: HouseholdSizeRow[]) => {
        this.householdSizeData = {
          labels: rows.map(r => r.dataYear.toString()),
          datasets: [{
            label: 'Household size',
            data: rows.map(r => r.householdSize)
          }]
        };
      });
  }

  loadMigrationTrend() {
    if (!this.selectedSiteId) return;
    this.reportService.getMigrationTrend(this.selectedSiteId)
      .subscribe((rows: MigrationTrendRow[]) => {
        const labels = rows.map(r => r.dataYear.toString());
        this.migrationTrendData = {
          labels,
          datasets: [
            {
              label: 'In-migration',
              data: rows.map(r => r.inMigration),
              fill: false
            },
            {
              label: 'Out-migration',
              data: rows.map(r => r.outMigration),
              fill: false
            }
          ]
        };
      });
  }


}
