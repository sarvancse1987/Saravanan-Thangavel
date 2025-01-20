import { Component } from '@angular/core';

interface Log {
  orderId: string;
  workOrderId: string;
  documentType: string;
  documentName: string;
  subfolder: string;
  status: string;
  jobDateTime: Date;
  isCollapsed: boolean;
  initiate: boolean;
}

interface PaginationModel {
  page: number;
  itemsPerPage: string;
}

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.css']
})
export class LogViewerComponent {
  groupedLogs: { [key: string]: Log[] } = {};  // Will hold logs grouped by date
  logs: Log[] = [];  // Holds all logs data
  displayedLogs: Log[] = [];  // Holds the logs to display for pagination

  constructor() {
    // Example logs for initialization (you can replace this with actual data fetching)
    this.logs = [
      {
        orderId: '123',
        workOrderId: 'WO123',
        documentType: 'PDF',
        documentName: 'Doc 1',
        subfolder: 'Subfolder 1',
        status: 'Completed',
        jobDateTime: new Date('2025-01-16T10:00:00Z'),
        isCollapsed: false,
        initiate: false,
      },
      {
        orderId: '124',
        workOrderId: 'WO124',
        documentType: 'PDF',
        documentName: 'Doc 2',
        subfolder: 'Subfolder 2',
        status: 'In Progress',
        jobDateTime: new Date('2025-01-16T11:00:00Z'),
        isCollapsed: false,
        initiate: false,
      },
      {
        orderId: '125',
        workOrderId: 'WO125',
        documentType: 'Word',
        documentName: 'Doc 3',
        subfolder: 'Subfolder 3',
        status: 'Completed',
        jobDateTime: new Date('2025-01-17T10:00:00Z'),
        isCollapsed: false,
        initiate: false,
      },
      {
        orderId: '126',
        workOrderId: 'WO126',
        documentType: 'Excel',
        documentName: 'Doc 4',
        subfolder: 'Subfolder 4',
        status: 'Pending',
        jobDateTime: new Date('2025-01-17T12:00:00Z'),
        isCollapsed: false,
        initiate: false,
      },
    ];

    // Initialize the grouped logs
    this.groupLogs();
  }

  groupLogs() {
    // Group the logs by date (assuming `jobDateTime` is the key for grouping)
    this.groupedLogs = this.logs.reduce((groups, log) => {
      const dateKey = log.jobDateTime.toISOString().split('T')[0]; // Get the date as string 'YYYY-MM-DD'
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
      return groups;
    }, {});

    // Initialize displayedLogs to show the logs for the first page
    this.updateGroupedLogs({ page: 1, itemsPerPage: '5' });
  }

  updateGroupedLogs(paginationModel: PaginationModel) {
    const itemsPerPage = parseInt(paginationModel.itemsPerPage, 10);
    const startIndex = (paginationModel.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Flatten the groupedLogs into a single array
    const allLogs = [];
    for (let date in this.groupedLogs) {
      allLogs.push(...this.groupedLogs[date]);
    }

    // Slice the flattened logs for pagination
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    // Regroup the logs by date after pagination
    this.groupedLogs = paginatedLogs.reduce((groups, log) => {
      const dateKey = log.jobDateTime.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
      return groups;
    }, {});
  }

  onPaginationChange(paginationModel: PaginationModel) {
    console.log('Current page:', paginationModel.page);
    this.updateGroupedLogs(paginationModel);
  }

  // Toggle the collapsed state for a specific log entry
  onToggleCollapse(date: string) {
    this.groupedLogs[date] = this.groupedLogs[date].map(log => {
      log.isCollapsed = !log.isCollapsed;
      return log;
    });
  }

  updateStatus(log: Log) {
    log.initiate = !log.initiate;
  }
}
<div *ngFor="let date of Object.keys(groupedLogs)">
  <tr>
    <td colspan="8" class="icon-folder-group">
      <label (click)="onToggleCollapse(date)">
        {{ date }} ({{ groupedLogs[date].length }} items)
      </label>
    </td>
  </tr>
  <tr *ngFor="let log of groupedLogs[date]" [hidden]="log.isCollapsed">
