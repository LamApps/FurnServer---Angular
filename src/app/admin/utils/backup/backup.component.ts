import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { BackupService } from '../../../@core/@services/backup.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'ngx-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {
  private alive = true;

  settings = {
    mode: 'external',
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
    },
    edit: {
      editButtonContent: '<i class="fas fa-download fa-xs"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
    },
    columns: {
      id: {
        title: "ID"
      },
      created: {
        title: "Created"
      },
      filename: {
        title: 'Filename',
      },
    }
  };

  source;

  constructor(
    private backupService: BackupService, 
    private router: Router, 
    private toastrService: NbToastrService) { 
    this.loadData();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  loadData() {
    this.backupService.list().subscribe((result) => {
      const data = result.map(backup => {
        return {
          id: backup.id,
          filename: backup.filename,
          created: new Date(backup.created).toLocaleDateString() + " " + new Date(backup.created).toLocaleTimeString()
        }
      })
      this.source = data;
    })
  }

  onCreate() {
    this.backupService.add().subscribe((result) => {
      if (result) {
        this.toastrService.success('', 'Backup created!');
        this.loadData();
      }
    });
  }

  onDownload($event: any) {
    this.backupService.download($event.data.id).subscribe((data) => {
      const blob = new Blob([data], {type: 'application/sql'});

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = $event.data.filename;
      link.click();
    }, error => {
      console.log(error);
    })
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete backup?') && $event.data.id) {
      this.backupService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Backup deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
}
