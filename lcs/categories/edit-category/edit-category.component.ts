import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute} from '@angular/router';
import { CategoriesService } from '../../../../common/services/categories/categories.service';
import { MdSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FileUploader } from 'ng2-file-upload';
import { Constants } from '../../../../constant';
import { $http } from '@angular/common/http';

const URL = Constants.uploadCategoryPictureUrl;
const CategoryPictureURL = Constants.uploadAssets + '/category/';

declare var $: any;

@Component({
  selector: 'edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'],
})
export class EditCategoryComponent implements OnInit {
  public id;
  public sub;
  public category;
  public SuccessMessage;
  public categories;
  public categoryImages: any[];
  public categoryPictureFileName;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    headers: [{ name: 'x-access-token', value: localStorage['jwtToken'] }, {name: 'Access-Control-Allow-Credentials', value: true}],
  });
  private form: FormGroup;
  private translate;
  constructor(formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private categoriesService: CategoriesService,
              public translate: TranslateService,
              public snackBar: MdSnackBar) {
    this.categoryImages = [];
    this.translate=  translate;
    this.form = formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
      description: ['', [
        Validators.required,
      ]],
      parent_id: ['', []]
    });

    this.uploader.onAfterAddingFile = (fileItem) => {
      fileItem.withCredentials = false;
    };
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      this.categoryPictureFileName = response;
      this.updateCategory(); // Updating category
    };

    this.uploader.onBuildItemForm = (item, form) => {
      if (this.category.picture_name != null) {
        form.append('oldFilename', this.category.picture_name ); // Deleting Old File
      }
    };
  }

  public ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.id = params['id'];
    });

    this.categoriesService.getCategories().then((result) => {
      this.categories = result;
    });
    this.categoriesService.getById(this.id).then((data) => {
        this.category = data;
        this.form.setValue({
          name: data.name,
          description: data.description,
          parent_id: data.parent_id
        });
        this.categoryPictureFileName = data.picture_name != null ? data.picture_name  : null;
        this.categoryImages.push(CategoryPictureURL + (this.categoryPictureFileName != null ? this.categoryPictureFileName  : 'default-picture.jpg') );
      }
    );
  }

  /*Function to update category*/
  public save() {
    if (!this.form.valid) { return; }
    let that = this;
    this.translate.get('CategoryUpdatedSuccessfully').subscribe((res) => {
      this.SuccessMessage = res;
    });

    if (this.uploader.queue.length > 0) {
      this.uploader.uploadAll();
    } else {
      this.updateCategory();
    }
  }

  /*
  *Function to add update category
  */
  public updateCategory() {
    this.categoriesService.getById(this.id).then((user) => {
      let categorydata = {
        name: this.form.value.name,
        description: this.form.value.description,
        picture_name: this.categoryPictureFileName,
        parent_id: this.form.value.parent_id,
      };
      this.categoriesService.updateCategory(this.id, categorydata).then((res) => {
        this.openSnackBar(res.message, this.SuccessMessage );
        setTimeout(() => {
          this.router.navigate(['/admin/categories']);
        }, 2000);
      }).catch((error) => {
        if (error.message === 'Cannot read property \'navigate\' of undefined') {
          window.location.href = '/admin/login';
        }
      });
    });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
    });
  }
}
