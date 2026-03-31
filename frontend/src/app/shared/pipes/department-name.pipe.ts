import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'departmentName',
    standalone: true
})
export class DepartmentNamePipe implements PipeTransform {
    transform(id: number, departments: any[]): string {
        if (!departments) return '';
        const dept = departments.find(d => d.department_id === Number(id));
        return dept ? dept.department_name : 'Unknown';
    }
}
