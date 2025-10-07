import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsModalPage } from './items-modal.page';

describe('ItemsModalPage', () => {
  let component: ItemsModalPage;
  let fixture: ComponentFixture<ItemsModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemsModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
