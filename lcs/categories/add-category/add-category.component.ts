import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService } from '../../../../common/services/categories/categories.service';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileUploader } from 'ng2-file-upload';
import { Constants } from '../../../../constant';

const URL = Constants.uploadCategoryPictureUrl;

@Component({
  selector: 'add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  public categories;
  public SuccessMessage;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    headers: [{ name: 'x-access-token', value: localStorage['jwtToken'] },
      {name: 'Access-Control-Allow-Credentials', value: true}
    ],
  });
  private form: FormGroup;
  //private translate;
  constructor(
            public translate: TranslateService,
            private categoriesService: CategoriesService,
            formBuilder: FormBuilder,
            public snackBar: MdSnackBar,
            private router: Router) {
    this.translate =  translate;
    this.form = formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
      description: ['', [
        Validators.required,
      ]],
      picture_name: ['', []],
      parent_id: ['', []]
    });

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      this.addCategory(response); // Adding new category
    };

    this.uploader.onAfterAddingFile = (fileItem) => {
      fileItem.withCredentials = false;
    };

    this.uploader.onBuildItemForm = (item, form) => {
    //
    };

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
    //
    };
  }

  public ngOnInit() {
    this.categoriesService.getCategories().then((result) => {
      this.categories = result;
    });
  }
  /*
  * Function to check validation, upload image and add new category
  * */
  public save() {
    if (!this.form.valid) { return; } // Checking validation

    if (this.uploader.queue.length > 0) {
      this.uploader.uploadAll();
    } else {
      this.addCategory();
    }
  }

  /*
  *Function to add new category
  */
  public addCategory( PictureName = null) {
    let ParentId = this.form.value.parent_id;
    let categoryData = {
      name: this.form.value.name,
      description: this.form.value.description,
      picture_name: PictureName,
      parent_id: ParentId,
    };

    this.translate.get('CategoryAddedSuccessfully').subscribe((res) => {
      this.SuccessMessage = res;
    });
    this.categoriesService.addCategory(categoryData).then((res) => {
      /*this.form.setValue({
        name: '',
        description: '',
        parent_id: ''
      });*/

      this.openSnackBar( res.message, this.SuccessMessage );
      setTimeout(() => {
        this.router.navigate(['/admin/categories']);
      }, 2000);
    }).catch((error) => {
      if (error.message === 'Cannot read property \'navigate\' of undefined') {
        window.location.href = '/admin/login';
      }
    });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
    });
  }
}
