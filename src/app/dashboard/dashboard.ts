import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Router } from '@angular/router';
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

export type BirthsByMotherAgeChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  colors: string[];
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

export type BirthPlaceOutcomeChartOptions = {
  series: any[];
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

export type BirthDeathAreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  markers: ApexMarkers;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
};

export type ChildDeathsStillbirthsChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  markers: ApexMarkers;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
};

export type Under5DeathPlaceChartOptions = {
  series: any[];            // any[] so we can use "group"
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
};

export type MortalityRatesChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
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

  birthsByMotherAgeChartOptions: BirthsByMotherAgeChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 450,
      stacked: true,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%'
      }
    },
    stroke: {
      show: true,
      width: .3,
      colors: ['#dfdfdfff']   // white border
    },
    colors: [
      '#bb0303ff', // 10–14
      '#2563EB', // 15–19
      '#088f5bff', // 20–24
      '#18c9a2ff', // 25–29
      '#8cc900d8', // 30–34
      '#e4b006ff', // 35–39
      '#eb7e19ff', // 40–44
      '#2b0101ff'  // 45–49
    ],
    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toLocaleString();
      },
      style: {
        fontSize: '10px',
        fontWeight: 'bold',
        colors: ['#ffffff']
      }
    },
    xaxis: {
      title: { text: 'Number of births' },
      labels: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toLocaleString();
        }
      }
    },
    yaxis: {
      title: { text: 'Year' }
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
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
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  birthPlaceOutcomeChartOptions: BirthPlaceOutcomeChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 650,
      stacked: true,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 2
      }
    },
    stroke: {
      show: true,
      width: .3,
      colors: ['#dfdfdfff']   // white border
    },
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    yaxis: {
      title: { text: 'Number of births' }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => Number(val).toLocaleString(),
      style: { fontWeight: 'bold' }
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

  birthDeathAreaChartOptions: BirthDeathAreaChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 400,
      toolbar: { show: true }
    },
    colors: [
      '#1D4ED8', // Live births - blue
      '#DC2626'  // Deaths - red
    ],
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    yaxis: {
      title: { text: 'Number of events' },
      labels: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toLocaleString();
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toLocaleString();
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.2,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    markers: {
      size: 4,
      strokeWidth: 2
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
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
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  childDeathsStillbirthsChartOptions: ChildDeathsStillbirthsChartOptions = {
    series: [],
    chart: {
      type: 'line',        // base type for mixed chart
      height: 420,
      stacked: false,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        columnWidth: '55%'
      }
    },
    colors: [
      '#280b91c9', // column: stillbirths (orange)
      '#da9c16ff', // area: neonatal
      '#a310c0ff', // area: infant
      '#df0808ff'  // area: under-5
    ],
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    yaxis: {
      title: { text: 'Number of deaths' },
      labels: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toLocaleString();
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: [0, 3, 3, 3]   // 0 for column, 3 for area outlines
    },

    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toLocaleString();
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },
    fill: {
      type: ['solid', 'gradient', 'gradient', 'gradient'],
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.15,
        opacityFrom: 0.25,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    markers: {
      size: [0, 4, 4, 4],
      strokeWidth: 2
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
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
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  under5DeathPlaceChartOptions: Under5DeathPlaceChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 450,
      stacked: true,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 2
      }
    },
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    yaxis: {
      title: { text: 'Number of deaths / stillbirths' },
      labels: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toLocaleString();
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toLocaleString();
      },
      style: {
        fontSize: '10px',
        fontWeight: 'bold'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
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
      borderColor: '#e5e7eb',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    }
  };

  mortalityRatesChartOptions: MortalityRatesChartOptions = {
    series: [],
    chart: {
      type: 'line',
      height: 420,
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    colors: [
      '#6366F1', // Under-5
      '#0EA5E9', // Infant
      '#10B981', // Neonatal
      '#F97316'  // Stillbirth ratio
    ],
    xaxis: {
      categories: [],
      title: { text: 'Year' }
    },
    yaxis: {
      title: { text: 'Rate per 1,000 live births' },
      labels: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toFixed(1);
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => {
        const num = Number(val);
        return isNaN(num) ? '' : num.toFixed(1);
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },
    markers: {
      size: 4,
      strokeWidth: 2
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: any) => {
          const num = Number(val);
          return isNaN(num) ? '' : num.toFixed(1);
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
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

  constructor(private reportService: Report , private router: Router) { }

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

   openPopulationPyramidsPage() {
    debugger;
    if (!this.selectedSiteId) { return; }
    this.router.navigate(
      ['/population-pyramids'],
      { queryParams: { siteId: this.selectedSiteId } }
    );
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
    this.loadBirthsByMotherAgeTrend();
    this.loadBirthPlaceOutcomeByYear();
    this.loadBirthDeathTrend();
    this.loadChildDeathsStillbirthsTrend();
    this.loadUnder5DeathAndStillbirthPlaceTrend();
    this.loadMortalityRatesTrend();
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

  loadBirthsByMotherAgeTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getBirthsByMotherAgeTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        const d10_14 = rows.map(r => r.births10_14);
        const d15_19 = rows.map(r => r.births15_19);
        const d20_24 = rows.map(r => r.births20_24);
        const d25_29 = rows.map(r => r.births25_29);
        const d30_34 = rows.map(r => r.births30_34);
        const d35_39 = rows.map(r => r.births35_39);
        const d40_44 = rows.map(r => r.births40_44);
        const d45_49 = rows.map(r => r.births45_49);

        this.birthsByMotherAgeChartOptions.xaxis = {
          ...this.birthsByMotherAgeChartOptions.xaxis,
          categories: years   // for horizontal bar, Apex still uses xaxis.categories
        };

        this.birthsByMotherAgeChartOptions.series = [
          { name: '10–14', data: d10_14 },
          { name: '15–19', data: d15_19 },
          { name: '20–24', data: d20_24 },
          { name: '25–29', data: d25_29 },
          { name: '30–34', data: d30_34 },
          { name: '35–39', data: d35_39 },
          { name: '40–44', data: d40_44 },
          { name: '45–49', data: d45_49 }
        ];
      });
  }

  loadBirthPlaceOutcomeByYear() {
    if (!this.selectedSiteId) return;

    this.reportService.getBirthPlaceOutcomeByYear(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        this.birthPlaceOutcomeChartOptions = {
          ...this.birthPlaceOutcomeChartOptions,
          xaxis: {
            ...this.birthPlaceOutcomeChartOptions.xaxis,
            categories: years
          },
          series: [
            // Group 1: Facility
            {
              name: 'Facility live births',
              group: 'facility',
              data: rows.map(r => r.facilityLive),
              color: '#1D4ED8'
            },
            {
              name: 'Facility stillbirths',
              group: 'facility',
              data: rows.map(r => r.facilityStill),
              color: '#8f0746ff'
            },

            // Group 2: Home / community
            {
              name: 'Home/community live births',
              group: 'home',
              data: rows.map(r => r.homeCommLive),
              color: '#16A34A'
            },
            {
              name: 'Home/community stillbirths',
              group: 'home',
              data: rows.map(r => r.homeCommStill),
              color: '#c23a04ff'
            },

            // Group 3: Unknown place
            {
              name: 'Unknown place live births',
              group: 'unknown',
              data: rows.map(r => r.unknownLive),
              color: '#250792ff'
            },
            {
              name: 'Unknown place stillbirths',
              group: 'unknown',
              data: rows.map(r => r.unknownStill),
              color: '#e60d0dff'
            }
          ]
        };
      });

  }

  loadBirthDeathTrend() {
    if (!this.selectedSiteId) { return; }

    this.reportService.getBirthDeathTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());
        const births = rows.map(r => r.totalLiveBirths);
        const deaths = rows.map(r => r.totalDeaths);

        this.birthDeathAreaChartOptions = {
          ...this.birthDeathAreaChartOptions,
          xaxis: {
            ...this.birthDeathAreaChartOptions.xaxis,
            categories: years
          },
          series: [
            { name: 'Live births', data: births },
            { name: 'Deaths', data: deaths }
          ]
        };
      });
  }

  loadChildDeathsStillbirthsTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getChildDeathsAndStillbirthsTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());
        const still = rows.map(r => r.stillbirths);
        const neonatal = rows.map(r => r.neonatalDeaths);
        const infant = rows.map(r => r.infantDeaths);
        const under5 = rows.map(r => r.under5Deaths);

        this.childDeathsStillbirthsChartOptions = {
          ...this.childDeathsStillbirthsChartOptions,
          xaxis: {
            ...this.childDeathsStillbirthsChartOptions.xaxis,
            categories: years
          },
          series: [
            {
              name: 'Stillbirths (place of death)',
              type: 'column',
              data: still
            },
            {
              name: 'Neonatal deaths (<28 days)',
              type: 'area',
              data: neonatal
            },
            {
              name: 'Infant deaths (<12 months)',
              type: 'area',
              data: infant
            },
            {
              name: 'Child deaths (<5 years)',
              type: 'area',
              data: under5
            }
          ]
        };
      });
  }

  loadUnder5DeathAndStillbirthPlaceTrend() {
    if (!this.selectedSiteId) return;

    this.reportService
      .getUnder5DeathAndStillbirthByPlaceTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        const facilityU5 = rows.map(r => r.facilityUnder5);
        const facilityStill = rows.map(r => r.facilityStill);
        const homeU5 = rows.map(r => r.homeUnder5);
        const homeStill = rows.map(r => r.homeStill);
        const unknownU5 = rows.map(r => r.unknownUnder5);
        const unknownStill = rows.map(r => r.unknownStill);

        this.under5DeathPlaceChartOptions = {
          ...this.under5DeathPlaceChartOptions,
          xaxis: {
            ...this.under5DeathPlaceChartOptions.xaxis,
            categories: years
          },
          series: [
            // Group 1: Facility
            {
              name: 'Under-5 deaths – facility',
              type: 'bar',
              group: 'facility',
              data: facilityU5,
              color: '#945400ff'
            },
            {
              name: 'Stillbirths – facility',
              type: 'bar',
              group: 'facility',
              data: facilityStill,
              color: '#f59b26ff'
            },

            // Group 2: Home / community
            {
              name: 'Under-5 deaths – home/community',
              type: 'bar',
              group: 'home',
              data: homeU5,
              color: '#9b0b42c5'
            },
            {
              name: 'Stillbirths – home/community',
              type: 'bar',
              group: 'home',
              data: homeStill,
              color: '#f50561ff'
            },

            // Group 3: Unknown place
            {
              name: 'Under-5 deaths – unknown',
              type: 'bar',
              group: 'unknown',
              data: unknownU5,
              color: '#1c720bc2'
            },
            {
              name: 'Stillbirths – unknown',
              type: 'bar',
              group: 'unknown',
              data: unknownStill,
              color: '#25df00ff'
            }
          ]
        };
      });
  }

  loadMortalityRatesTrend() {
    if (!this.selectedSiteId) return;

    this.reportService.getMortalityRatesTrend(this.selectedSiteId)
      .subscribe(rows => {
        const years = rows.map(r => r.dataYear.toString());

        const under5 = rows.map(r => r.under5Rate);
        const infant = rows.map(r => r.infantRate);
        const neonatal = rows.map(r => r.neonatalRate);
        const stillbr = rows.map(r => r.stillbirthRatio);

        this.mortalityRatesChartOptions = {
          ...this.mortalityRatesChartOptions,
          xaxis: {
            ...this.mortalityRatesChartOptions.xaxis,
            categories: years
          },
          series: [
            { name: 'Under-5 mortality rate', data: under5 },
            { name: 'Infant mortality rate', data: infant },
            { name: 'Neonatal mortality rate', data: neonatal },
            { name: 'Stillbirth ratio', data: stillbr }
          ]
        };
      });
  }

}
