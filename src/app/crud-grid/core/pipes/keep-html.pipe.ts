import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'keepHtml', pure: false })
export class EscapeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(content: string): SafeHtml{
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}


/**
 * Use that pipe in your template
 *
 * <div [innerHTML]="data | keepHtml"></div>
 *
 */
