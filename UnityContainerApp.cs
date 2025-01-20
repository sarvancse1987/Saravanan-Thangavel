import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

export class PaginationModel {
  itemsPerPage!: number; // Changed to number for consistency
  page!: number;
  fieldType?: string;
}

export interface SftpConfigurationLogResponse {
  jobDateTime: Date;
  orderId: number;
  workOrderId: number;
  documentType: string;
  documentName: string;
  subfolder: string;
  status: string;
  initiate: boolean;
  isCollapsed: boolean;
}

@Component({
  selector: 'app-client-sftp-config-log',
  templateUrl: './client-sftp-config-log.component.html',
  styleUrls: ['./client-sftp-config-log.component.scss']
})
export class ClientSftpConfigLogComponent implements OnInit, OnDestroy {
  clientSFTPConfigLogForm: FormGroup;
  subscriptions: Subscription[] = [];
  sftpConfigurationLogs: SftpConfigurationLogResponse[] = [];
  displayedLogs: { [key: string]: SftpConfigurationLogResponse[] } = {};
  rowsCount: number = 0;

  // Default Pagination Model
  paginationModel: PaginationModel = {
    itemsPerPage: 10,
    page: 1,
    fieldType: 'jobDateTime' // Optional: Sorting or filtering field
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.clientSFTPConfigLogForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      exosOrderID: [null, Validators.required],
      documentType: [null, Validators.required]
    });

    this.getSftpConfigurationLog();
  }

  getSftpConfigurationLog() {
    // Sample Data
    this.sftpConfigurationLogs = [
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 1, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 2, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      // Add more sample data
    ];

    this.rowsCount = this.sftpConfigurationLogs.length; // Total rows count
    this.updateDisplayedLogs();
  }

  updateDisplayedLogs() {
    const { itemsPerPage, page } = this.paginationModel;

    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice logs for current page
    const paginatedLogs = this.sftpConfigurationLogs.slice(startIndex, endIndex);

    // Group logs by date
    this.displayedLogs = paginatedLogs.reduce((groups, log) => {
      const date = log.jobDateTime.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {});
  }

  onPageChange(newPage: number) {
    this.paginationModel.page = newPage;
    this.updateDisplayedLogs();
  }

  getDisplayedLogKeys(): string[] {
    return Object.keys(this.displayedLogs);
  }

  onToggleCollapse(date: string) {
    this.displayedLogs[date].forEach((log) => {
      log.isCollapsed = !log.isCollapsed;
    });
  }

  updateStatus(log: SftpConfigurationLogResponse) {
    log.status = log.initiate ? 'Initiated' : 'Created';
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }
}
