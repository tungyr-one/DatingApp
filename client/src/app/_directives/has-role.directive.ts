import { AccountService } from 'src/app/_services/account.service';
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[appHasRole]' // *appHasRole='["Admin", "Thing"]'
})
export class HasRoleDirective implements OnInit{
  @Input() appHasRole: string[] = [];
  user: User = {} as User;

  constructor(private viewContainerRef: ViewContainerRef, private templateRef: TemplateRef<any>,
    private accountServie: AccountService) {
      this.accountServie.currentUser$.pipe(take(1)).subscribe({
        next: user => {
          if (user) this.user = user;
        }
      })
     }

  ngOnInit(): void {
    if (this.user.roles.some(r => this.appHasRole.includes(r))){
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
    else{
      this.viewContainerRef.clear()
    }
  }

}
