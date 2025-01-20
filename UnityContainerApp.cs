import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PaginationModel, SftpConfigurationLogResponse } from '../admin.model';

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
  rowsCount: number;

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
    // Sample data
    this.sftpConfigurationLogs = [
      { jobDateTime: new Date('2025-01-16T10:00:00'), orderId: 1, workOrderId: 1, documentType: 'Type1', documentName: 'Doc1', subfolder: 'Folder1', status: 'Created', initiate: false, isCollapsed: false },
      { jobDateTime: new Date('2025-01-17T11:00:00'), orderId: 2, workOrderId: 2, documentType: 'Type2', documentName: 'Doc2', subfolder: 'Folder2', status: 'Created', initiate: false, isCollapsed: false },
      // Add more sample data here
    ];

    this.rowsCount = this.sftpConfigurationLogs.length;
    this.updateDisplayedLogs({ itemsPerPage: 10, page: 1 });
  }

  updateDisplayedLogs(paginationData: { itemsPerPage: number; page: number }) {
    const { itemsPerPage, page } = paginationData;

    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice logs for pagination
    const paginatedLogs = this.sftpConfigurationLogs.slice(startIndex, endIndex);

    // Group paginated logs by date
    this.displayedLogs = paginatedLogs.reduce((groups, log) => {
      const date = log.jobDateTime.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {});
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
 <ng-container *ngFor="let date of getDisplayedLogKeys()">
        <tr>
          <td colspan="8" class="icon-folder-group">
            <span class="icon-folder-group"></span>
            <label (click)="onToggleCollapse(date)">
              {{ date }} ({{ displayedLogs[date].length }} items)
            </label>
          </td>
        </tr>


export class PaginationModel {
    itemsPerPage!: string;
    page!: number;
    fieldType!: string;
}
