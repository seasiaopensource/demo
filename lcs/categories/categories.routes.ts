import { AddCategoryComponent } from './add-category/add-category.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';

export const categoryRoutes = [
    {
        path: '', children: [
            { path: '', component: CategoryListComponent },
            { path: 'add', component: AddCategoryComponent },
            { path: 'edit/:id', component: EditCategoryComponent }
        ]
    },
];
