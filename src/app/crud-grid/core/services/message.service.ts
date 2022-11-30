import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  open(
    message: string = 'Hello!!!',
    type: string = 'info',
    action: string = 'Dismiss',
    config = {}
  ): void {
    config = {
      duration: 10 * 1000,  // (ms)
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`,`oscar-snackbar`],
      ...config
    };
    this.snackBar.open(message, action, config);
  }
}
