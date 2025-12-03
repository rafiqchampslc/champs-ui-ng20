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
  NgApexchartsModule,
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
  ApexGrid,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle
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

export type MaritalStatusChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
};

export type YearWiseMarriageAgeChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions; // Added for horizontal bars
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
  legend: ApexLegend;
  colors: string[];
};

export type BirthOutcomeChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
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

  maritalStatusChartOptions: MaritalStatusChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'      // 👈 RIGHT PLACE (this is valid!)
        }
      }
    },
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,              // moves label above bar
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#05690dff']        // black for readability
      },
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toLocaleString();
      }
    },

    stroke: {
      show: true,
      width: 1
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toLocaleString();
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    }
  };

  yearWiseMarriageAgeChartOptions: YearWiseMarriageAgeChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 500,
      stacked: true,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        dataLabels: {
          position: 'center'
        }
      }
    },
    colors: [
      '#08306B', '#08519C', '#3182BD', '#90c9e7ff',
      '#85024cff', '#be0d69d0', '#f756c7ff', '#b83ff0ff'
    ],
    dataLabels: {
      enabled: true,
      formatter: (val: any) => Math.abs(Number(val)).toLocaleString(),
      style: {
        colors: ['#fff']
      }
    },
    title: {
      text: 'Marriage Distribution: Male (Left) vs Female (Right)',
      align: 'center'
    },
    xaxis: {
      categories: [],
      title: { text: 'Number of Marriages' },
      labels: {
        formatter: (val: any) => Math.abs(Number(val)).toLocaleString()
      }
    },
    yaxis: {
      title: { text: 'Year' },
      labels: {
        formatter: (val: any) => String(val).replace(/,/g, '')
      }
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: any) => Math.abs(Number(val)).toLocaleString()
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  birthOutcomeChartOptions: BirthOutcomeChartOptions = {
    series: [],
    chart: {
      height: 450,
      type: 'line',
      stacked: false,
      toolbar: { show: true }
    },
    colors: [
      '#1D4ED8',   // Live births
      '#c2064eff', // Stillbirths
      '#dd900aff', // Abortions / miscarriages
      '#01972eff', // Currently pregnant women (area)
      '#8013acff'  // Total outcomes (line)
    ],

    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },

    yaxis: {
      title: { text: 'Number of events' }
    },

    // 🔢 Data labels visible but lightweight
    dataLabels: {
      enabled: true,
      formatter: (val: any) => Number(val).toLocaleString(),
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },

    stroke: {
      width: [2, 2, 2, 3, 4],     // ✔ Line thicker and above area
      curve: 'smooth'
    },

    fill: {
      type: ['solid', 'solid', 'solid', 'gradient', 'solid'],
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        opacityFrom: 0.55,
        opacityTo: 0.25,
        stops: [0, 100, 100, 100]
      }
    },

    markers: {
      size: [0, 0, 0, 4, 6],   // ✔ markers on area & line only
      strokeWidth: 2,
      hover: { size: 7 }
    },

    grid: {
      show: true,
      borderColor: '#e0e0e0',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },

    legend: {
      position: 'top',
      horizontalAlign: 'center'
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: any) => Number(val).toLocaleString()
      }
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
      debugger;
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
    this.loadMaritalStatusChangeTrend();
    this.loadMarriageAgeDistributionTrend();
    this.loadBirthOutcomePregnancyTrend();

  }

  loadBirthOutcomePregnancyTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getBirthOutcomePregnancyTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        const live = rows.map(r => r.liveBirths);
        const still = rows.map(r => r.stillBirths);
        const abort = rows.map(r => r.abortionsMiscarriages);
        const preg = rows.map(r => r.currentlyPregnant);
        const total = rows.map(r => r.totalOutcome);

        this.birthOutcomeChartOptions.xaxis = {
          ...this.birthOutcomeChartOptions.xaxis,
          categories: years
        };

        this.birthOutcomeChartOptions.series = [
          {
            name: 'Live births',
            type: 'column',
            data: live
          },
          {
            name: 'Stillbirths',
            type: 'column',
            data: still
          },
          {
            name: 'Abortions / miscarriages',
            type: 'column',
            data: abort
          },
          {
            name: 'Currently pregnant women',
            type: 'area',
            data: preg
          },
          {
            name: 'Total outcomes',
            type: 'line',
            data: total
          }
        ];
      });
  }

  loadMarriageAgeDistributionTrend() {
    if (!this.selectedSiteId) { return; }

    this.reportService.getMarriageAgeDistributionTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        // male values negative (left side), female positive (right)
        const maleU18 = rows.map(r => -Number(r.maleUnder18));
        const male18_25 = rows.map(r => -Number(r.male18To25));
        const male25_35 = rows.map(r => -Number(r.male25To35));
        const male35p = rows.map(r => -Number(r.male35Plus));

        const femU18 = rows.map(r => Number(r.femaleUnder18));
        const fem18_25 = rows.map(r => Number(r.female18To25));
        const fem25_35 = rows.map(r => Number(r.female25To35));
        const fem35p = rows.map(r => Number(r.female35Plus));

        this.yearWiseMarriageAgeChartOptions.xaxis = {
          ...this.yearWiseMarriageAgeChartOptions.xaxis,
          categories: years
        };

        this.yearWiseMarriageAgeChartOptions.series = [
          { name: 'Male <18', data: maleU18 },
          { name: 'Male 18-25', data: male18_25 },
          { name: 'Male 25-35', data: male25_35 },
          { name: 'Male 35+', data: male35p },
          { name: 'Female <18', data: femU18 },
          { name: 'Female 18-25', data: fem18_25 },
          { name: 'Female 25-35', data: fem25_35 },
          { name: 'Female 35+', data: fem35p }
        ];
      });
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
        const male = rows.map(r => -Number(r.maleCount));
        const female = rows.map(r => Number(r.femaleCount));

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
        const male = rows.map(r => -Number(r.maleCount));
        const female = rows.map(r => Number(r.femaleCount));

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

  loadMaritalStatusChangeTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getMaritalStatusChangeTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        this.maritalStatusChartOptions.xaxis = {
          ...this.maritalStatusChartOptions.xaxis,
          categories: years
        };

        this.maritalStatusChartOptions.series = [
          {
            name: 'Total marriages / cohabitation changes',
            data: rows.map(r => r.totalMSChanges)
          },
          {
            name: 'Divorces',
            data: rows.map(r => r.divorces)
          },
          {
            name: 'Separations',
            data: rows.map(r => r.separations)
          },
          {
            name: 'Widows / widowers',
            data: rows.map(r => r.widowsWidowers)
          },
          {
            name: 'Reunions',
            data: rows.map(r => r.reunions)
          }
        ];
      });
  }


}
