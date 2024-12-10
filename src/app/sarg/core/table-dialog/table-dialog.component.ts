import {Component, Input} from '@angular/core';
import {ImportsModule} from '../../service/import';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';

@Component({
	selector: 'app-table-dialog',
	standalone: true,
	imports: [ImportsModule],
	templateUrl: './table-dialog.component.html',
	styleUrl: './table-dialog.component.scss',
	providers: [DialogService], // Agregamos DialogService aquí
})
export class TableDialogComponent {
    @Input() data: any[] = [];
    @Input() columns: any[] = [];

    // Opciones de filtrado
    filterOptions = [
        { label: 'Contiene', value: 'contains' },
        { label: 'No contiene', value: 'notContains' },
        { label: 'Igual', value: 'equals' },
        { label: 'No igual', value: 'notEquals' }
    ];

    first = 0;
    rows = 10;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {}

    ngOnInit() {
        // Ajustar filas según tamaño de pantalla
        this.rows = window.innerWidth < 768 ? 5 : 10;

        this.data = this.config.data?.data || [];
        this.columns = this.config.data?.columns || [];
    }

    // Métodos para paginación
    next() {
        this.first += this.rows;
    }

    prev() {
        this.first -= this.rows;
    }

    reset() {
        this.first = 0;
    }

    closeDialog(): void {
        this.ref.close();
    }
}
