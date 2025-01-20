import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClienteleService } from '../../clientele/clientele.service';
import { LoggerService } from '../../services/logger/logger.service';
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
  sftpConfigurationLogs: SftpConfigurationLogResponse[] = [];
  groupedLogs: { [key: string]: SftpConfigurationLogResponse[] } = {};
  displayedLogs: { [key: string]: SftpConfigurationLogResponse[] } = {};
  rowsCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private clienteleService: ClienteleService,
    private loggerService: LoggerService
  ) {}

  ngOnInit() {
    this.clientSFTPConfigLogForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      exosOrderID: [null, Validators.required],
      documentType: [null, Validators.required]
    });

    this.getSftpConfigurationLog();
  }

  get f() {
    return this.clientSFTPConfigLogForm.controls;
  }

  // Sample data and grouping by date
  getSftpConfigurationLog() {
    this.sftpConfigurationLogs = [
      // Sample data with consistent structure
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 1, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 2, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 3, workOrderId: 3, documentType: 'Type3', documentName: 'Doc3', subfolder: 'Folder3', status: 'Created', initiate: false, isCollapsed: false },
      // Additional data...
    ];

    this.groupLogsByDate();
    this.rowsCount = this.sftpConfigurationLogs.length;

    // Initial pagination
    this.updateDisplayedLogs({ itemsPerPage: '10', page: 1, fieldType: 'page' });
  }

  // Group logs by date
  groupLogsByDate() {
    this.groupedLogs = this.sftpConfigurationLogs.reduce((groups, log) => {
      const date = log.jobDateTime.toISOString().split('T')[0]; // Extract only the date
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {});
  }

  // Return grouped log keys for display
  getGroupedLogKeys(): string[] {
    return Object.keys(this.groupedLogs);
  }

  // Toggle collapse for a date group
  onToggleCollapse(date: string) {
    this.groupedLogs[date].forEach(log => {
      log.isCollapsed = !log.isCollapsed;
    });
  }

  // Update displayed logs based on pagination
  updateDisplayedLogs(paginationModel: PaginationModel) {
    const itemsPerPage = parseInt(paginationModel.itemsPerPage, 10);
    const startIndex = (paginationModel.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Flatten grouped logs into a single array
    const allLogs = Object.values(this.groupedLogs).reduce((acc, val) => acc.concat(val), []);

    // Slice logs for the current page
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    // Regroup paginated logs by date
    this.displayedLogs = paginatedLogs.reduce((groups, log) => {
      const date = log.jobDateTime.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {});
  }

  // Update log status based on checkbox
  updateStatus(log: SftpConfigurationLogResponse) {
    log.status = log.initiate ? 'Initiated' : 'Created';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}


<div *ngFor="let date of getGroupedLogKeys()" class="log-group">
    <h5 class="date-header" (click)="onToggleCollapse(date)">
      {{ date }}
      <button class="btn btn-link">
        {{ groupedLogs[date][0]?.isCollapsed ? 'Expand' : 'Collapse' }}
      </button>
    </h5>

    <div
      *ngIf="!groupedLogs[date][0]?.isCollapsed"
      class="log-details"
    >
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Work Order ID</th>
            <th>Document Type</th>
            <th>Document Name</th>
            <th>Subfolder</th>
            <th>Status</th>
            <th>Initiate</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of groupedLogs[date]">
