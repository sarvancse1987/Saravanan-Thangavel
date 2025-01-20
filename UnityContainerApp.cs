<div class="page-wrapper-3 full-height-container">
    <div class="container-fluid full-height-content">
        <div class="row full-height-row" [formGroup]="clientSFTPConfigLogForm">
            <div class="col-lg-3">
                <div class="card mb-4 mb-xxl-5">
                    <div class="card-header bg-transparent pb-0">
                        <h2 class="card-title mb-0 font-weight-normal"> Search </h2>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="clients">Clients</label>
                            <select id="integrators" class="custom-select" name="source">
                                <option value="" selected>Select All</option>
                                <option *ngFor="let source of []"></option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="startDate">From Date</label>
                            <input type="datetime-local" id="startDate" class="form-control" placeholder="Start Date"
                                formControlName="startDate">
                        </div>
                        <div class="form-group">
                            <label for="endDate">End Date</label>
                            <input type="datetime-local" id="endDate" class="form-control" placeholder="End Date"
                                formControlName="endDate">
                        </div>
                        <div class="form-group">
                            <label for="exosOrderID">Exos Orde ID</label>
                            <input type="text" id="exosOrderID" class="form-control" placeholder="Exos Order Id"
                                formControlName="exosOrderID">
                        </div>
                        <div class="form-group">
                            <label for="documentType">Document Type</label>
                            <!-- <app-sftp-multi-select [isAllowSelectAll]="true" [maxTags]="5"
                                [SelectedOptions]="selectedDocumentTypeItems"
                                (MultiSelectedOptions)="onDocumentTypeChange($event)" [dataSource]="documentTypeItems"
                                [placeholderText]="'Document Type'"
                                [requiredOption]="submitted && this.f.documentType.value?.length==0"
                                [isReset]="true"></app-sftp-multi-select> -->
                            <select id="integrators" class="custom-select" name="source">
                                <option value="" selected>Select All</option>
                                <option *ngFor="let source of []"></option>
                            </select>
                        </div>
                    </div>
                    <div class="card-footer bottom-buttons-footer d-flex justify-content-end bg-transparent pt-0">
                        <button class="btn btn-secondary-text">Clear</button>
                        <button class="btn btn-primary">Search</button>
                    </div>
                </div>
            </div>
            <div class="col-lg-9">
                <div class="position-relative full-height-scroll">
                    <button data-toggle="modal" data-target="#communication-template-modal"
                        class="btn btn-primary-text btn-regular-text btn-table-card-layout mr-n4 mt-n3"> Initiate
                        Delivery
                    </button>

                    <table class="table table-sm table-striped table-borderless table-card-layout mb-4 mb-xxl-5">
                        <caption>Sftp Logs</caption>
                        <thead>
                            <tr>
                                <th scope="col" width="7%">Order Id</th>
                                <th scope="col" width="10%">Work Order Id</th>
                                <th scope="col" width="12%">Document Type</th>
                                <th scope="col" width="15%">Document Name</th>
                                <th scope="col" width="15%">Subfolder</th>
                                <th scope="col" width="10%">Status</th>
                                <th scope="col" width="11%">Initiate By Selection</th>
                                <th scope="col" width="20%">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ng-container *ngFor="let date of getGroupedLogKeys()">
                                <tr>
                                    <td colspan="8" class="icon-folder-group">
                                        <span class="icon-folder-group"></span>
                                        <label (click)="onToggleCollapse(date)">
                                            {{ date }} ({{ groupedLogs[date].length }} items)
                                        </label>
                                    </td>
                                </tr>
                                <tr *ngFor="let log of groupedLogs[date]; let i = index" [hidden]="log.isCollapsed">
                                    <td>{{ log.orderId }}</td>
                                    <td>{{ log.workOrderId }}</td>
                                    <td>{{ log.documentType }}</td>
                                    <td>{{ log.documentName }}</td>
                                    <td>{{ log.subfolder }}</td>
                                    <td>{{ log.status }}</td>
                                    <td>
                                        <input type="checkbox" [(ngModel)]="log.initiate" (change)="updateStatus(log)"
                                            class="form-checkbox" [ngModelOptions]="{standalone: true}" />
                                    </td>
                                    <td>
                                        <div class="gn-col-7">
                                            <div class="more-options-drop-down">

                                                <button type="button"
                                                    class="btn btn-icon btn-icon-secondary-text dropdown-toggle more-ic-btn"
                                                    id="docdropdownMenu_{{ i }}" data-toggle="dropdown"
                                                    aria-haspopup="true" aria-expanded="false"
                                                    aria-label="More options">
                                                    <span class="icon-more-options" aria-hidden="true">...</span>
                                                </button>

                                                <div class="dropdown-menu" aria-labelledby="docdropdownMenu_{{ i }}">
                                                    <a class="dropdown-item"
                                                        (click)="onResubmitDocument(log, $event)">Resubmit</a>
                                                    <a class="dropdown-item" data-toggle="modal"
                                                        data-target="#om-add-doc" (click)="getDocToEdit(log)">Track
                                                        Error</a>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </ng-container>
                        </tbody>
                    </table>

                    <app-admin-pagination [rowsCount]="rowsCount"
                        [resetPagination]="isResetPagination"
                        (paginationEmitter)="onPaginationChange($event)"></app-admin-pagination>
                </div>
            </div>
        </div>
    </div>
</div>

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '../../services/logger/logger.service';
import { Subscription } from 'rxjs';
import { ClienteleService } from '../../clientele/clientele.service';
import { PaginationModel, SftpConfigurationLogResponse } from '../admin.model';

@Component({
  selector: 'app-client-sftp-config-log',
  templateUrl: './client-sftp-config-log.component.html',
  styleUrls: ['./client-sftp-config-log.component.scss']
})
export class ClientSftpConfigLogComponent implements OnInit, OnDestroy {
  clientSFTPConfigLogForm: FormGroup;
  subscriptions: Subscription[] = [];
  componentName: string = "Client SFTP Configuration Log";
  selectedDocumentTypeItems: any[] = [];
  documentTypeItems: any[] = [];
  submitted: boolean = false;
  isResetPagination: boolean = false;
  rowsCount: number;
  sftpConfigurationLogs: SftpConfigurationLogResponse[] = [];
  displayedLogs: { [key: string]: SftpConfigurationLogResponse[] } = {};
  groupedLogs: { [key: string]: SftpConfigurationLogResponse[] } = {};

  constructor(
    private fb: FormBuilder,
    private clienteleService: ClienteleService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.clientSFTPConfigLogForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      exosOrderID: [null, Validators.required],
      documentType: [null, Validators.required]
    });
    this.getSftpConfigurationLog();
  }

  get f() { return this.clientSFTPConfigLogForm.controls; }

  getSftpConfigurationLog() {
    // Sample data
    this.sftpConfigurationLogs = [
      // Sample data
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 1, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 2, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 3, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 4, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 5, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 6, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 7, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 8, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 9, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 10, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 11, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 12, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 13, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 14, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 15, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 16, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 17, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 18, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
    ];

    this.groupLogsByDate();
    this.rowsCount = this.sftpConfigurationLogs.length;
    this.updateDisplayedLogs({ itemsPerPage: '15', page: 1, fieldType: 'page' });
  }

  groupLogsByDate() {
    this.groupedLogs = this.sftpConfigurationLogs.reduce((groups, log) => {
      const dateTime = log.jobDateTime.toISOString().replace('T', ' ').split('.')[0];
      if (!groups[dateTime]) {
        groups[dateTime] = [];
      }
      groups[dateTime].push(log);
      return groups;
    }, {});
  }

  getGroupedLogKeys(): string[] {
    return Object.keys(this.groupedLogs);
  }

  onToggleCollapse(date: string) {
    this.groupedLogs[date].forEach(log => log.isCollapsed = !log.isCollapsed);
  }

  updateStatus(log: SftpConfigurationLogResponse) {
    log.status = log.initiate ? 'Initiated' : 'Created';
  }

  onDocumentTypeChange(options: any) {
    // Implement your logic here
  }

  onFilterLog() {
    // Implement your logic here
  }

  onInitiateDelivery() {
    // Implement your logic here
  }

  onResubmitDocument(data: SftpConfigurationLogResponse, event: Event) {
    // Implement your logic here
  }

  getDocToEdit(data: SftpConfigurationLogResponse) {
    // Implement your logic here
  }

  deleteDocuments(data: SftpConfigurationLogResponse) {
    // Implement your logic here
  }

  onEmailClick(data: SftpConfigurationLogResponse) {
    // Implement your logic here
  }

  onPaginationChange(paginationModel: PaginationModel) {
    console.log('Current page:', paginationModel.page);
    this.updateDisplayedLogs(paginationModel);
  }

  updateDisplayedLogs(paginationModel: PaginationModel) {
    const itemsPerPage = parseInt(paginationModel.itemsPerPage, 10);
    const startIndex = (paginationModel.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
  
    // Flatten the grouped logs into a single array
    const flattenedLogs = Object.values(this.groupedLogs).reduce((acc, val) => acc.concat(val), []);
  
    // Slice the flattened logs based on pagination
    const paginatedLogs = flattenedLogs.slice(startIndex, endIndex);
  
    // Regroup the paginated logs by date
    this.displayedLogs = paginatedLogs.reduce((groups, log) => {
      const dateTime = log.jobDateTime.toISOString().split('T')[0];
      if (!groups[dateTime]) {
        groups[dateTime] = [];
      }
      groups[dateTime].push(log);
      return groups;
    }, {});
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
