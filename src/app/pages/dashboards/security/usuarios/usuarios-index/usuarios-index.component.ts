import { Component, OnInit, NgModule, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralModule } from 'src/app/general/general.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService, Messages, MessageType } from 'src/app/admin/helper.service';
import { UsuariosPaswordFormComponent } from '../usuarios-pasword-form/usuarios-pasword-form.component'
import { GeneralParameterService } from '../../../../../generic/general.service';
import { DatatableParameter } from '../../../../../admin/datatable.parameters';
import { Usuario } from '../usuarios.module';
import { LANGUAGE_DATATABLE } from 'src/app/admin/datatable.language';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-usuarios-index',
  standalone: false,
  templateUrl: './usuarios-index.component.html',
  styleUrl: './usuarios-index.component.css'
})
export class UsuariosIndexComponent implements OnInit {
  API_URL: any;
  title = "Listado de Usuarios";
  breadcrumb!: any[];
  botones: String[] = ['btn-nuevo'];
  listUsuarios = signal<Usuario[]>([]);



  
  public dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
  

  constructor(
    private service: GeneralParameterService,
    private modalService: NgbModal,
    private helperService: HelperService
  ) {
    this.breadcrumb = [{ name: `Inicio`, icon: `fa-duotone fa-house` }, { name: "Seguridad", icon: "fa-duotone fa-lock" }, { name: "Usuarios", icon: "fa-duotone fa-user-gear" }];
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
          this.service.datatable('Usuario', data).subscribe((res) => {
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
            title: 'USUARIO',
            data: 'userName',
            className: 'text-center',
          },
          {
            title: 'PERSONA',
            data: 'persona',
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

                           <button type="button" title="Eliminar" class="btn btn-sm text-secondary btn-dropdown-change-password" data-id="${id}">
                           <i class="fa-duotone fa-lock-keyhole" data-id="${id}"></i>
                             Cambiar Contraseña</button>

                          </div>`;
            },
          },
        ],
        drawCallback: () => {
          $('.btn-dropdown-modificar')
            .off()
            .on('click', (event: any) => {
              this.update(event.currentTarget.dataset.id);
            });

          $('.btn-dropdown-eliminar')
            .off()
            .on('click', (event: any) => {
              this.deleteGeneric(event.currentTarget.dataset.id);
            });
           $('.btn-dropdown-change-password')
            .off()
            .on('click', (event: any) => {
              this.changePassword(event.currentTarget.dataset.id);
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

  

  refrescarTabla() {
    $("#datatable").DataTable().destroy();
    this.listUsuarios = signal<Usuario[]>([]);
    this.cargarLista();
  }

  nuevo() {
    this.helperService.redirectApp("dashboard/seguridad/usuarios/crear");
  }

  update(id: any) {
    this.helperService.redirectApp(`dashboard/seguridad/usuarios/editar/${id}`);
  }

  deleteGeneric(id: any) {
    this.helperService.confirmDelete(() => {
      this.service.delete("Usuario", id).subscribe(
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

  changePassword(id: any) {
    let modal = this.modalService.open(UsuariosPaswordFormComponent, { size: 'lg', keyboard: false, backdrop: true, centered: true });

    modal.componentInstance.titleData = "Usuario";
    modal.componentInstance.serviceName = "Usuario";
    modal.componentInstance.id = id;
    modal.componentInstance.key = "Persona";

    modal.result.then(res => {
      if (res) {
        this.refrescarTabla();
      }
    })
  }
}

@NgModule({
  declarations: [
    UsuariosIndexComponent,
  ],
  imports: [
    CommonModule,
    GeneralModule,
  ]
})
export class UsuariosIndexModule { }