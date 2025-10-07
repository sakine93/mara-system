import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-items-modal',
  templateUrl: './items-modal.page.html',
  styleUrls: ['./items-modal.page.scss'],
})
export class ItemsModalPage implements OnInit {
  itemsByType: any[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('Bijoux reçus : ', this.itemsByType);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
