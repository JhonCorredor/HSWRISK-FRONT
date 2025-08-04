import { Component, OnInit, NgModule, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralModule } from 'src/app/general/general.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService, Messages, MessageType } from 'src/app/admin/helper.service';
import { PersonasFormComponent } from '../personas-form/personas-form.component'
import { GeneralParameterService } from '../../../../../generic/general.service';
import { DatatableParameter } from '../../../../../admin/datatable.parameters';
import { Persona } from '../personas.module';
import { LANGUAGE_DATATABLE } from 'src/app/admin/datatable.language';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-personas-index',
  standalone: false,
  templateUrl: './personas-index.component.html',
  styleUrl: './personas-index.component.css'
})
export class PersonasIndexComponent implements OnInit {
  API_URL: any;
  title = "Listado de Personas";
  breadcrumb!: any[];
  botones: String[] = ['btn-nuevo'];
  listPersonas = signal<Persona[]>([]);


  public dtTrigger: Subject<any> = new Subject();
      @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
      dtOptions: DataTables.Settings = {};

  constructor(
    private service: GeneralParameterService,
    private modalService: NgbModal,
    private helperService: HelperService
  ) {
    this.breadcrumb = [{ name: `Inicio`, icon: `fa-duotone fa-house` }, { name: "Seguridad", icon: "fa-duotone fa-lock" }, { name: "Personas", icon: "fa-duotone fa-user" }];
  }

  ngOnInit(): void {
    this.cargarLista();
  }

  
    cargarLista() {
      this.dtOptions = {
        dom: 'Blfrtip',
        processing: true,
        ordering: true,
        responsive: true,
        paging: true,
        order: [0, 'desc'],
        language: LANGUAGE_DATATABLE,
        ajax: (dataTablesParameters: any, callback: any) => {
          var data = new DatatableParameter();
          data.pageNumber = '';
          data.pageSize = '';
          data.filter = '';
          data.columnOrder = '';
          data.directionOrder = '';
          this.service.datatable('persona', data).subscribe((res) => {
            callback({
              recordsTotal: res.data.length,
              recordsFiltered: res.data.length,
              draw: dataTablesParameters.draw,
              data: res.data,
            });
          });
        },
        columns: [
          {
            title: 'TIPO DOCUMENTO',
            data: 'tipoDocumento',
            className: 'text-center',
          },
          {
            title: 'DOCUMENTO',
            data: 'documento',
            className: 'text-center',
          },
                    {
            title: 'NOMBRE COMPLETO',
            data: null,
            className: 'text-center',
            render: function (item: any) {
            var convenio = `${item.primerNombre ?? ''} ${item.segundoNombre ? item.segundoNombre + ' ' : ''}${item.primerApellido ?? ''} ${item.segundoApellido ?? ''}`;
            return convenio;
          }
          },
                    {
            title: 'DIRECCIÓN',
            data: 'direccion',
            className: 'text-center',
          },
                    {
            title: 'TELÉFONO',
            data: 'telefono',
            className: 'text-center',
          },
                    {
            title: 'EMAIL',
            data: 'email',
            className: 'text-center',
          },
                              {
            title: 'GENERO',
            data: 'genero',
            className: 'text-center',
          },
                              {
            title: 'FECHA DE NACIMIENTO',
            data: 'dateBirth',
            className: 'text-center',
              render: function (data: string) {
              try {
                const date = new Date(data);
                if (isNaN(date.getTime())) return '';
                const year = date.getFullYear();
                const month = ('0' + (date.getMonth() + 1)).slice(-2);
                const day = ('0' + date.getDate()).slice(-2);
                return `${year} / ${month} / ${day}`;
              } catch {
                return '';
              }
            }
          },
                              {
            title: 'PAIS DE NACIMIENTO',
            data: 'countryBirth',
            className: 'text-center',
          },

          {
            title: 'ESTADO',
            data: 'activo',
            className: 'text-center',
            render: function (item: any) {
              if (item) {
                return "<label class='text-center text-success'>Activo</label>";
              } else {
                return "<label class='text-center text-danger'>Inactivo</label>";
              }
            },
          },
          {
            title: 'ACCIONES',
            orderable: false,
            data: 'id',
            className: 'text-center',
            render: function (id: any) {
              return `<div role="group"  class="button-group " aria-label="Basic example">
                            <button type="button" title="Editar" class="btn btn-sm text-secondary btn-dropdown-modificar" data-id="${id}"><i class="fa-duotone fa-pen-to-square" data-id="${id}"></i> Editar</button>
                            <button type="button" title="Eliminar" class="btn btn-sm text-secondary btn-dropdown-eliminar" data-id="${id}"><i class="fa-duotone fa-trash-can" data-id="${id}"></i> Eliminar</button>

                          </div>`;
            },
          },
        ],
        drawCallback: () => {
          $('.btn-dropdown-modificar')
            .off()
            .on('click', (event: any) => {
              this.updateGeneric(event.currentTarget.dataset.id);
            });

          $('.btn-dropdown-eliminar')
            .off()
            .on('click', (event: any) => {
              this.deleteGeneric(event.currentTarget.dataset.id);
            });
        },
      };
    }


        ngAfterViewInit() {
      this.dtTrigger.next(this.dtOptions);
    }

    ngOnDestroy(): void {
      this.dtTrigger.unsubscribe();
    }

  getData(): Promise<any> {
    var data = new DatatableParameter(); data.pageNumber = ""; data.pageSize = ""; data.filter = ""; data.columnOrder = ""; data.directionOrder = "";
    return new Promise((resolve, reject) => {
      this.service.datatable("Persona", data).subscribe(
        (datos) => {
          resolve(datos);
        },
        (error) => {
          reject(error);
        }
      )
    });
  }

  refrescarTabla() {
    $("#datatable").DataTable().destroy();
    this.listPersonas = signal<Persona[]>([]);
    this.cargarLista();
  }

  nuevo() {
    let modal = this.modalService.open(PersonasFormComponent, { size: 'lg', keyboard: false, backdrop: true });

    modal.componentInstance.titleData = "Persona";
    modal.componentInstance.serviceName = "Persona";
    modal.componentInstance.key = "Ciudad";

    modal.result.then(res => {
      if (res) {
        this.refrescarTabla();
      }
    })
  }

  updateGeneric(id: any) {
    let modal = this.modalService.open(PersonasFormComponent, { size: 'lg', keyboard: false, backdrop: true });

    modal.componentInstance.titleData = "Persona";
    modal.componentInstance.serviceName = "Persona";
    modal.componentInstance.id = id;
    modal.componentInstance.key = "Ciudad";

    modal.result.then(res => {
      if (res) {
        this.refrescarTabla();
      }
    })
  }

  deleteGeneric(id: any) {
    this.helperService.confirmDelete(() => {
      this.service.delete("Persona", id).subscribe(
        (response) => {
          if (response.status) {
            this.helperService.showMessage(MessageType.SUCCESS, Messages.DELETESUCCESS);
            this.refrescarTabla();
          }
        },
        (error) => {
          this.helperService.showMessage(MessageType.ERROR, error);
        }
      )
    });
  }
}

@NgModule({
  declarations: [
    PersonasIndexComponent,
  ],
  imports: [
    CommonModule,
    GeneralModule,
  ]
})
export class PersonasIndexModule { }