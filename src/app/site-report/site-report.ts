import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Report, SiteDto, SiteAggregatedReportRow } from '../service/report';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface IndicatorPivotRow {
  indicatorCode: string;
  indicatorName: string;
  values: { [year: number]: number | null };
}

@Component({
  selector: 'app-site-report',
  standalone: false,
  templateUrl: './site-report.html',
  styleUrl: './site-report.css',
})
export class SiteReport implements OnInit {

  // sites: SiteDto[] = [];
  selectedSiteId: number | null = null;

  // data from API
  rawRows: SiteAggregatedReportRow[] = [];

  // header info
  countryName = '';
  siteName = '';
  lastUploadDate: Date | null = null;

  // table info
  years: number[] = [];
  pivotRows: IndicatorPivotRow[] = [];

  loading = false;
  error: string | null = null;

  constructor(private reportService: Report,
    private route: ActivatedRoute,
    private location: Location) { }

  ngOnInit(): void {
    
    this.route.queryParamMap.subscribe(params => {
      const id = Number(params.get('siteId'));
      if (id && !Number.isNaN(id)) {
        this.selectedSiteId = id;
        this.loadReport();
      } else {
        this.error = 'No site selected. Please go back to dashboard.';
      }
    });
  }

 goBack() {
    this.location.back();
  }


  needsSpacerRow(name: string): boolean {
  if (!name) return false;

  const trimmed = name.trim();

  return (
    /^Date round data collection ended$/i.test(trimmed) ||
    /^Number of households refused to give interview$/i.test(trimmed) ||
    /^People moved out of households \(Out-migration\)$/i.test(trimmed) ||
    /^Reunions$/i.test(trimmed) ||
    /^Women identified after delivery$/i.test(trimmed) ||
    /^Still birth Outcome Unknown$/i.test(trimmed) ||
    /^Gestational age Unknown$/i.test(trimmed) ||
    /^Children Death Place Unknown$/i.test(trimmed) 
  );
}

  loadReport() {
    if (!this.selectedSiteId) return;

    this.loading = true;
    this.error = null;

    this.reportService.getSiteAggregatedReport(this.selectedSiteId)
      .subscribe({
        next: rows => {
          this.loading = false;
          this.rawRows = rows;

          if (!rows.length) {
            this.countryName = '';
            this.siteName = '';
            this.lastUploadDate = null;
            this.years = [];
            this.pivotRows = [];
            return;
          }

          this.countryName = rows[0].countryName;
          this.siteName = rows[0].siteName;
          const last = rows[0].lastEntryDate;
          this.lastUploadDate = last ? new Date(last) : null;

          this.buildPivot();
        },
        error: _ => {
          this.loading = false;
          this.error = 'Failed to load site report.';
        }
      });
  }

  private buildPivot() {
    // years
    const yearSet = new Set<number>();
    for (const r of this.rawRows) {
      yearSet.add(r.dataYear);
    }
    this.years = Array.from(yearSet).sort((a, b) => a - b);

    // pivot by indicatorCode
    const map = new Map<string, IndicatorPivotRow>();

    for (const r of this.rawRows) {
      if (!map.has(r.indicatorCode)) {
        map.set(r.indicatorCode, {
          indicatorCode: r.indicatorCode,
          indicatorName: r.indicatorName,
          values: {}
        });
      }
      const row = map.get(r.indicatorCode)!;
      row.values[r.dataYear] = r.indicatorValue;
    }

    this.pivotRows = Array.from(map.values());
    //.sort((a, b) => a.indicatorName.localeCompare(b.indicatorName));
  }

  // helper for UI
  formatUploadDate(): string {
    if (!this.lastUploadDate) return '';
    return this.lastUploadDate.toLocaleDateString();
  }
  isLightIndent(name: string): boolean {
    if (!name) return false;

    const patterns = [
      // Household visit indicators
      /^Active households/i,
      /^Number of households visited/i,
      /^Number of households interviewed successfully/i,
      /^Number of absent households/i,
      /^Number of households refused to give interview/i,

      // Total population (male/female)
      /^Total male population of households interviewed/i,
      /^Total female population of households interviewed/i,

      // NEW → Migration
      /^People moved into households/i,
      /^People moved out of households/i,

      // NEW → MS Changes breakdown
      /^MS Changes Male Total/i,
      /^MS Changes Female Total/i,
      /^Divorces/i,
      /^Separations/i,
      /^Widows\/widowers/i,
      /^Reunions/i,

      // NEW → Pregnancy identification
      /^Women identified on 1st trimester/i,
      /^Women identified on 2nd trimester/i,
      /^Women identified on 3rd trimester/i,
      /^Women identified after delivery/i,

      // NEW → Birth totals
      /^Total Male Live births/i,
      /^Total Female Live births/i,

      // NEW → Death totals
      /^Total male deaths/i,
      /^Total female deaths/i,
    ];

    return patterns.some(p => p.test(name));
  }

  isDeepIndent(name: string): boolean {
    if (!name) return false;

    if (/^Gestational age at delivery$/i.test(name.trim())) {
      return false;
    }
    // Population age groups
    const maleAgePattern = /^Male(s)?\s(.*years|<1 year|1 to <2 years)/i;
    const femaleAgePattern = /^Female(s)?\s(.*years|<1 year|1 to <2 years)/i;

    // Death by age
    const maleDeathPattern = /^Male deaths/i;
    const femaleDeathPattern = /^Female deaths/i;

    // Births by mother’s age
    const allBirthsPattern = /^All births to mothers aged\s\d{2}-\d{2}\syears/i;
    const maleBirthsPattern = /^Male births to mothers aged\s\d{2}-\d{2}\syears/i;
    const femaleBirthsPattern = /^Female births to mothers aged\s\d{2}-\d{2}\syears/i;

    // Death place
    const deathPlacePatterns = [
      /^Stillbirths Death Place/i,
      /^Neonates Death Place/i,
      /^Infants Death Place/i,
      /^Children Death Place/i
    ];

    // Age at marriage
    const marriagePatterns = [
      /^Age at marriage.*?\(Male\)/i,
      /^Age at marriage.*?\(Female\)/i
    ];

    // Stillbirth outcome sex
    const stillbirthSexPattern = /^Stillbirth Outcome sex/i;

    // Abortion Outcome
    const abortionOutcomePattern = /^Abortion Outcome/i;

    // Live birth place
    const liveBirthPlacePattern = /^Live birth Place/i;

    // Stillbirth outcome place
    const stillBirthOutcomePlacePattern = /^Still birth Outcome/i;

    // Gestational age
    const gestationalAgePattern = /^Gestational age/i;

    // Exclusions
    const exclude =
      /(Total|Summary|Rate|Ratio|Index|Overall|Population$|Outcome$)/i;

    if (exclude.test(name)) return false;

    return (
      maleAgePattern.test(name) ||
      femaleAgePattern.test(name) ||

      maleDeathPattern.test(name) ||
      femaleDeathPattern.test(name) ||

      allBirthsPattern.test(name) ||
      maleBirthsPattern.test(name) ||
      femaleBirthsPattern.test(name) ||

      deathPlacePatterns.some(p => p.test(name)) ||

      marriagePatterns.some(p => p.test(name)) ||

      stillbirthSexPattern.test(name) ||

      abortionOutcomePattern.test(name) ||

      liveBirthPlacePattern.test(name) ||

      stillBirthOutcomePlacePattern.test(name) ||

      gestationalAgePattern.test(name)
    );
  }

  isAgeGroup(name: string): boolean {
    if (!name) return false;

    // -----------------------------
    // POPULATION AGE GROUPS
    // -----------------------------
    const maleAgePattern = /^Male(s)?\s(.*years|<1 year|1 to <2 years)/i;
    const femaleAgePattern = /^Female(s)?\s(.*years|<1 year|1 to <2 years)/i;

    // -----------------------------
    // DEATH AGE GROUPS
    // -----------------------------
    const maleDeathPattern = /^Male deaths/i;
    const femaleDeathPattern = /^Female deaths/i;

    // -----------------------------
    // BIRTHS BY MOTHER’S AGE
    // -----------------------------
    const allBirthsPattern = /^All births to mothers aged\s\d{2}-\d{2}\syears/i;
    const maleBirthsPattern = /^Male births to mothers aged\s\d{2}-\d{2}\syears/i;
    const femaleBirthsPattern = /^Female births to mothers aged\s\d{2}-\d{2}\syears/i;

    // -----------------------------
    // DEATH PLACE PATTERNS
    // -----------------------------
    const stillbirthPlacePattern = /^Stillbirths Death Place/i;
    const neonatePlacePattern = /^Neonates Death Place/i;
    const infantPlacePattern = /^Infants Death Place/i;
    const childrenPlacePattern = /^Children Death Place/i;

    // -----------------------------
    // AGE AT MARRIAGE PATTERNS
    // -----------------------------
    const marriageMalePattern = /^Age at marriage .*?\(Male\)/i;
    const marriageFemalePattern = /^Age at marriage .*?\(Female\)/i;

    // -----------------------------
    // STILLBIRTH OUTCOME (SEX)
    // -----------------------------
    const stillbirthSexPattern = /^Stillbirth Outcome sex/i;

    // -----------------------------
    // ABORTION OUTCOME
    // -----------------------------
    const abortionOutcomePattern = /^Abortion Outcome/i;

    // -----------------------------
    // LIVE BIRTH PLACE
    // -----------------------------
    const liveBirthPlacePattern = /^Live birth Place/i;

    // -----------------------------
    // STILLBIRTH PLACE OUTCOME
    // -----------------------------
    const stillBirthOutcomePlacePattern = /^Still birth Outcome/i;

    // -----------------------------
    // GESTATIONAL AGE OUTCOME
    // -----------------------------
    const gestationalAgePattern = /^Gestational age/i;

    // -----------------------------
    // EXCLUSIONS (section headers & totals)
    // -----------------------------
    const exclude =
      /(Total|Summary|Rate|Ratio|Index|Outcome$|Overall|Household Size|MS Changes|Population$)/i;

    if (exclude.test(name)) return false;

    // -----------------------------
    // RETURN TRUE IF ANY INDENT RULE MATCHES
    // -----------------------------
    return (
      maleAgePattern.test(name) ||
      femaleAgePattern.test(name) ||

      maleDeathPattern.test(name) ||
      femaleDeathPattern.test(name) ||

      allBirthsPattern.test(name) ||
      maleBirthsPattern.test(name) ||
      femaleBirthsPattern.test(name) ||

      stillbirthPlacePattern.test(name) ||
      neonatePlacePattern.test(name) ||
      infantPlacePattern.test(name) ||
      childrenPlacePattern.test(name) ||

      marriageMalePattern.test(name) ||
      marriageFemalePattern.test(name) ||

      stillbirthSexPattern.test(name) ||

      abortionOutcomePattern.test(name) ||

      liveBirthPlacePattern.test(name) ||

      stillBirthOutcomePlacePattern.test(name) ||

      gestationalAgePattern.test(name)
    );
  }



  // ---------------- Excel export ----------------

  downloadExcel() {
    if (!this.pivotRows.length) return;

    const now = new Date();

    const wsData: any[][] = [];

    // Row 1: Country
    wsData.push([`Country name: ${this.countryName || ''}`]);

    // Row 2: Site
    wsData.push([`Site name: ${this.siteName || this.selectedSiteId}`]);

    // Row 3: Download date
    wsData.push([
      `Data download on: ${now.toLocaleString()}`
    ]);

    // Row 4: Data upload date (last entry)
    const uploadText = this.lastUploadDate
      ? this.lastUploadDate.toLocaleDateString()
      : 'N/A';
    wsData.push([
      `Data upload date: ${uploadText} (Last EntryDate from HDSSAggregateIndicatorsValue table for this site)`
    ]);

    wsData.push([]); // blank row 5
    wsData.push([]); // blank row 6

    // Row 7: year column headers (starting from column B)
    const yearHeaders = this.years.map(y => `***DSS Annual Report\n(Year of ${y})`);
    wsData.push(['', ...yearHeaders]);

    // Now indicator rows:
    // column A = Indicator name
    // columns B.. = values for each year
    for (const r of this.pivotRows) {
      const row: any[] = [r.indicatorName];
      for (const y of this.years) {
        const v = r.values[y];
        row.push(v != null ? Number(v) : '');
      }
      wsData.push(row);
    }

    // Build workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Optional simple styling (bold first 4 rows + header row)
    const range = XLSX.utils.decode_range(ws['!ref'] as string);

    // make first four rows bold
    for (let r = 0; r <= 3; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
      if (cell) {
        (cell as any).s = {
          font: { bold: true }
        };
      }
    }

    // header row (row 6 index, 0-based 6)
    const headerRowIndex = 6;
    for (let c = 1; c <= this.years.length; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRowIndex, c })];
      if (cell) {
        (cell as any).s = {
          font: { bold: true },
          alignment: { wrapText: true, horizontal: 'center' },
          fill: { patternType: 'solid', fgColor: { rgb: 'D9D9D9' } }
        };
      }
    }

    // column widths
    const colWidths = [
      { wch: 55 }, // indicator name
      ...this.years.map(_ => ({ wch: 15 }))
    ];
    (ws as any)['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Site-${this.selectedSiteId}`);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const fileName = `CHAMPS_HDSS_Site_${this.selectedSiteId}_${now.getFullYear()}.xlsx`;
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, fileName);
  }
}
