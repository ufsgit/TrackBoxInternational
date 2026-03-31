import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './constants';


@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private apiUrl = `${API_CONFIG.BASE_URL}/api`;


    constructor(private http: HttpClient) { }

    // Branch Management
    getBranches(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches`);
    }
    saveBranch(branch: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/branches`, branch);
    }
    deleteBranch(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/branches/${id}`);
    }

    getBranchDepartments(branchId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/branches/${branchId}/departments`);
    }

    updateBranchDepartments(branchId: number, departmentIds: number[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/branches/${branchId}/departments`, { departmentIds });
    }

    // Department Management
    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/departments`);
    }
    saveDepartment(dept: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/departments`, dept);
    }
    deleteDepartment(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/departments/${id}`);
    }

    // Enquiry Source Management
    getEnquirySources(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/enquiry-sources`);
    }
    saveEnquirySource(source: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/enquiry-sources`, source);
    }
    deleteEnquirySource(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/enquiry-sources/${id}`);
    }

    // Status Management (Master)
    getStatuses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/statuses`);
    }
    saveStatus(status: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/statuses`, status);
    }
    deleteStatus(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/statuses/${id}`);
    }

    // Department Status Mapping
    getDepartmentStatuses(deptId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/departments/${deptId}/statuses`);
    }

    updateDepartmentStatuses(departmentId: number, statusIds: number[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/departments/${departmentId}/statuses`, { statusIds });
    }

    // Educational Level Management
    getEducationalLevels(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/educational-levels`);
    }
    saveEducationalLevel(level: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/educational-levels`, level);
    }
    deleteEducationalLevel(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/educational-levels/${id}`);
    }

    // Study Field Management
    getStudyFields(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/study-fields`);
    }
    saveStudyField(field: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/study-fields`, field);
    }
    deleteStudyField(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/study-fields/${id}`);
    }

    // Application Status Management
    getApplicationStatuses(category?: string): Observable<any[]> {
        const url = category ? `${this.apiUrl}/application-statuses?category=${category}` : `${this.apiUrl}/application-statuses`;
        return this.http.get<any[]>(url);
    }
    saveApplicationStatus(status: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/application-statuses`, status);
    }
    deleteApplicationStatus(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/application-statuses/${id}`);
    }

    // Application Sub Status Management
    getApplicationSubStatuses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/application-sub-statuses`);
    }
    saveApplicationSubStatus(subStatus: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/application-sub-statuses`, subStatus);
    }
    deleteApplicationSubStatus(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/application-sub-statuses/${id}`);
    }
}
