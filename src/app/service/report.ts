import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:5000/api/reports';

export interface SiteDto { siteId: number; }
export interface YearDto { year: number; }

export interface HouseholdTrendRow {
  indicatorCode: string;
  dataYear: number;
  value: number;
}

export interface TotalPopulationRow {
  dataYear: number;
  totalPopulation: number;
}

export interface PopulationPyramidRow {
  ageGroupLabel: string;
  maleCount: number;
  femaleCount: number;
}

export interface ChildPyramidRow {
  ageGroupLabel: string;
  maleCount: number;
  femaleCount: number;
}

export interface HouseholdSizeRow {
  dataYear: number;
  householdSize: number;
}

export interface MigrationTrendRow {
  dataYear: number;
  inMigration: number;
  outMigration: number;
}

export interface PopulationSummaryTrendRow {
  dataYear: number;
  totalPopulation: number;
  reproductiveAgeWomen: number;
  under5Children: number;
}

export interface MaritalStatusChangeTrendRow {
  dataYear: number;
  totalMSChanges: number;
  divorces: number;
  separations: number;
  widowsWidowers: number;
  reunions: number;
}
export interface MarriageAgeDistributionTrendRow {
  dataYear: number;
  maleUnder18: number;
  male18To25: number;
  male25To35: number;
  male35Plus: number;
  femaleUnder18: number;
  female18To25: number;
  female25To35: number;
  female35Plus: number;
}

export interface BirthOutcomePregnancyTrendRow {
  dataYear: number;
  liveBirths: number;
  stillBirths: number;
  abortionsMiscarriages: number;
  currentlyPregnant: number;
  totalOutcome: number;
}



@Injectable({ providedIn: 'root' })
export class Report {
  constructor(private http: HttpClient) {}

  getSites(): Observable<SiteDto[]> {
    return this.http.get<SiteDto[]>(`${API_BASE}/sites`);
  }

  getYears(siteId: number): Observable<YearDto[]> {
    return this.http.get<YearDto[]>(`${API_BASE}/years`, {
      params: new HttpParams().set('siteId', siteId)
    });
  }

  getHouseholdTrend(siteId: number): Observable<HouseholdTrendRow[]> {
    return this.http.get<HouseholdTrendRow[]>(`${API_BASE}/household-trend`, {
      params: new HttpParams().set('siteId', siteId)
    });
  }

  getTotalPopulation(siteId: number): Observable<TotalPopulationRow[]> {
    return this.http.get<TotalPopulationRow[]>(`${API_BASE}/total-population`, {
      params: new HttpParams().set('siteId', siteId)
    });
  }

  getPyramid(siteId: number, year: number): Observable<PopulationPyramidRow[]> {
    return this.http.get<PopulationPyramidRow[]>(`${API_BASE}/pyramid`, {
      params: new HttpParams().set('siteId', siteId).set('year', year)
    });
  }

    getChildPyramid(siteId: number, year: number): Observable<ChildPyramidRow[]> {
    return this.http.get<ChildPyramidRow[]>(`${API_BASE}/child-pyramid`, {
      params: new HttpParams().set('siteId', siteId).set('year', year)
    });
  }

  getHouseholdSize(siteId: number): Observable<HouseholdSizeRow[]> {
    return this.http.get<HouseholdSizeRow[]>(`${API_BASE}/household-size`, {
      params: new HttpParams().set('siteId', siteId)
    });
  }

  getMigrationTrend(siteId: number): Observable<MigrationTrendRow[]> {
    return this.http.get<MigrationTrendRow[]>(`${API_BASE}/migration-trend`, {
      params: new HttpParams().set('siteId', siteId)
    });
  }

  getPopulationSummaryTrend(siteId: number) {
  return this.http.get<PopulationSummaryTrendRow[]>(
    `${API_BASE}/population-summary-trend`,
    { params: new HttpParams().set('siteId', siteId) }
  );
}

getMaritalStatusChangeTrend(siteId: number) {
  return this.http.get<MaritalStatusChangeTrendRow[]>(
    `${API_BASE}/marital-status-change-trend`,
    { params: new HttpParams().set('siteId', siteId) }
  );
}
getMarriageAgeDistributionTrend(siteId: number) {
  return this.http.get<MarriageAgeDistributionTrendRow[]>(
    `${API_BASE}/marriage-age-distribution-trend`,
    { params: new HttpParams().set('siteId', siteId) }
  );
}

getBirthOutcomePregnancyTrend(siteId: number) {
  return this.http.get<BirthOutcomePregnancyTrendRow[]>(
    `${API_BASE}/birth-outcome-pregnancy-trend`,
    { params: new HttpParams().set('siteId', siteId) }
  );
}

}
