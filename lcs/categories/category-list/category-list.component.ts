import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { CategoriesService } from '../../../../common/services/categories/categories.service';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { DialogDeleteComponent } from '../../../../common/dialogs/delete/dialog-delete.component';
import { TranslateService } from '@ngx-translate/core';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
declare var $: any;

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, AfterViewInit {
  public categories;
  public SuccessMessage;
  public DialogMessage;
  public categoryCount;
  public listCategoryFilter: string;
  public categoryControl = new FormControl();
  private nameFilter: Subject<string> = new Subject<string>();

  // Inject Angular2Apollo service
  constructor(
    public translate: TranslateService,
    private categoriesService: CategoriesService,
    public snackBar: MdSnackBar,
    public dialog: MdDialog
  ) {
    this.translate = translate;
  }

  /**
   * load category listing after the component initializes
   */
  public ngOnInit() {
    this.categoriesService.getCategories().then((result) => {
      this.categories = result;
      this.categoryCount = this.categories.length;
    });
    // Add debounce time to wait 300 ms for a new change instead of keep hitting the server
    this.categoryControl.valueChanges.debounceTime(300).subscribe((name) => {
      this.nameFilter.next(name);
    });
  }

  public ngAfterViewInit() {
    // Footable initialization
    setTimeout(() => {
      $('.footable').footable({
        paging: {
          size: 10
        }
      });
    }, 1000);
  }


  /**
   * delete category
   * @param id
   */
  public deleteCategory(id) {
    this.translate.get('DeleteCategory').subscribe((res) => {
      this.DialogMessage = res;
    });
    this.translate.get('CategoryDeletedSuccessfully').subscribe((res) => {
      this.SuccessMessage = res;
    });
    let dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: this.DialogMessage,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.categoriesService.delete(id)
          .then((response) => {
            this.openSnackBar(response.message, this.SuccessMessage );
            this.refetchCategory();
            setTimeout(() => {
              $('table').trigger('footable_redraw');
            }, 1000);
          })
          .catch((error) => {
            this.openSnackBar(error.message, 'error');
          });
      }
    });
  }

  /**
   * open toaster notification bar
   * @param message
   * @param action
   */
  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
    });
  }

  /**
   * fetch category details
   */
  public refetchCategory() {
    this.categoriesService.getCategories().then((data) => {
      this.categories = data;
    });
  }
}
