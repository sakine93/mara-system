import { Component, OnInit } from '@angular/core';
import { PostProvider } from '../../providers/post-provider';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-updateachat',
  templateUrl: './updateachat.page.html',
  styleUrls: ['./updateachat.page.scss'],
})
export class UpdateachatPage implements OnInit {
  titre: string = '';
  poids: number=0 ;
  amount: number= 0;
  id: number;
  supplier_name:string='';
  //cost_price:number;

  constructor(
    private postPvdr: PostProvider,
    private router: Router,
    public toastController: ToastController,
    private actRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.actRoute.params.subscribe((data: any) => {
      this.id = data.id;
      this.titre = data.titre;
      this.poids = 0;
      this.amount = 0;
      console.log(data);
      });

      
  }

  async updateachatProses() {
    if (this.poids <= 0){
      const toast = await this.toastController.create({
        message: 'Veuillez mettre le poids acheter svp',
        duration: 1000
      });
      toast.present();
    }else if(this.amount<=0){
      const toast = await this.toastController.create({
        message: 'Veuillez mettre le montant  svp',
        duration: 1000
      });
      toast.present();
    } else {
      let body = {
        aksi: 'updateachat',
        achat_id : this.id,
        titre:this.titre,
        poids : this.poids,
        amount:this.amount,
        supplier_name : this.supplier_name,
        
     
      };
      this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
        var alertpesan = data.msg;
        if (data.success) {
          this.router.navigate(['/achats']);
          
          const toast = await this.toastController.create({
            message: 'Achat du titre mise a jour avec succes',
            duration: 2000
          });
          toast.present();
        } else {
          const toast = await this.toastController.create({
            message: alertpesan,
            duration: 2000
          });
        }
      });


    }
  }


}
