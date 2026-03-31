import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './constants';


@Injectable({ providedIn: 'root' })
export class StudentService {
    private apiUrl = `${API_CONFIG.BASE_URL}/api`;


    constructor(private http: HttpClient) { }

    getStudents(filters: any = {}): Observable<any> {
        let params = new HttpParams();
        if (filters.deptId) params = params.set('deptId', filters.deptId);
        if (filters.assignedTo) params = params.set('assignedTo', filters.assignedTo);
        if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
        if (filters.toDate) params = params.set('toDate', filters.toDate);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.useDate !== undefined) params = params.set('useDate', filters.useDate.toString());
        if (filters.search) params = params.set('search', filters.search);
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<any>(`${this.apiUrl}/students`, { params });
    }

    getStudentById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/students/${id}`);
    }

    saveStudent(payload: { student: any, programs: any }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/students`, payload);
    }

    addFollowup(followupData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/followups`, followupData);
    }

    getDashboardStats(filter: string = 'month', fromDate?: string, toDate?: string): Observable<any> {
        let params = new HttpParams().set('filter', filter);
        if (fromDate) params = params.set('fromDate', fromDate);
        if (toDate) params = params.set('toDate', toDate);
        return this.http.get<any>(`${this.apiUrl}/dashboard`, { params });
    }

    getStudentApplication(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/students/${id}/application`);
    }

    saveStudentApplication(id: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/students/${id}/application`, data);
    }

    getStudentRegistration(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/students/${id}/registration`);
    }

    saveStudentRegistration(id: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/students/${id}/registration`, data);
    }

    deleteStudent(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/students/${id}`);
    }

    getLookups(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/lookups`);
    }

    // Report API
    getEnquiryReport(filters: any): Observable<any[]> {
        let params = new HttpParams();
        if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
        if (filters.toDate) params = params.set('toDate', filters.toDate);
        if (filters.search) params = params.set('search', filters.search);
        if (filters.branchId) params = params.set('branchId', filters.branchId);
        if (filters.staffId) params = params.set('staffId', filters.staffId);

        return this.http.get<any[]>(`${this.apiUrl}/reports/enquiry`, { params });
    }
    // Master Data
    getBranches(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches`);
    }

    getBranchDepartments(branchId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches/${branchId}/departments`);
    }

    getStaff(branchId?: any, deptId?: any): Observable<any[]> {
        let params = new HttpParams();
        if (branchId) params = params.set('branch_id', branchId.toString());
        if (deptId) params = params.set('department_id', deptId.toString());
        return this.http.get<any[]>(`${this.apiUrl}/staff`, { params });
    }
}
