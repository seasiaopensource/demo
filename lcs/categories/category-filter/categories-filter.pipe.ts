import { PipeTransform, Pipe } from '@angular/core';
import { ICategory } from '../categories.interface';
declare var $: any;
@Pipe({
  name: 'categoriesFilter'
})

export class CategoriesFilterPipe implements PipeTransform {
  transform(value: ICategory[], filtetBy: string): ICategory[] {
    setTimeout(() => {
      $('table').trigger('footable_redraw');
    }, 1000);
    filtetBy = filtetBy ? filtetBy.toLocaleLowerCase(): null;   // search in each product if is the same
    return filtetBy ? value.filter((category: ICategory) => category.name.toLocaleLowerCase().indexOf(filtetBy) !==-1) : value;
  }
}
