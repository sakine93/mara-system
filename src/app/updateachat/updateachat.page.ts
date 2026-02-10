import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PostProvider } from '../../providers/post-provider';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, FileEntry, Entry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

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
  imgBijou: string = '';
  imgRecto: string = '';
  imgVerso: string = '';
  
  imgBijouName: string = '';
  imgRectoName: string = '';
  imgVersoName: string = '';
  
  currentType: 'bijou' | 'recto' | 'verso';
  constructor(
    private postPvdr: PostProvider,
    private router: Router,
    public toastController: ToastController,
    private actRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private plt: Platform,
    private storage: Storage,
    private file: File,
    private webview: WebView,
    private camera: Camera,
    private http: HttpClient,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private androidPermissions: AndroidPermissions
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
  async selectImage(type: 'bijou' | 'recto' | 'verso') {
    this.currentType = type;
  
    const actionSheet = await this.actionSheetController.create({
      header: 'Choisir une image',
      buttons: [
        {
          text: '📷 Prendre une photo',
          icon: 'camera',
          handler: async (): Promise<boolean> => {
            const ok = await this.checkCameraPermission();
            if (ok) {
              this.takePicture(this.camera.PictureSourceType.CAMERA);
              return true;   // ✅ OBLIGATOIRE
            } else {
              this.showPermissionError();
              return false;  // ✅ OBLIGATOIRE
            }
          }
        },
        {
          text: '🖼 Choisir depuis la galerie',
          icon: 'image',
          handler: async (): Promise<boolean> => {
            const ok = await this.checkGalleryPermission();
            if (ok) {
              this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
              return true;   // ✅
            } else {
              this.showPermissionError();
              return false;  // ✅
            }
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
  
    await actionSheet.present();
  }
  async showPermissionError() {
    const toast = await this.toastController.create({
      message: 'Autorisez la caméra et les photos dans les paramètres',
      color: 'danger',
      duration: 2500
    });
    toast.present();
  }
  cancelImage(type: 'bijou' | 'recto' | 'verso') {
    if (type === 'bijou') {
      this.imgBijou = '';
      this.imgBijouName = '';
    }
  
    if (type === 'recto') {
      this.imgRecto = '';
      this.imgRectoName = '';
    }
  
    if (type === 'verso') {
      this.imgVerso = '';
      this.imgVersoName = '';
    }
  }
  async updateachatProses() {
    if (!this.imgBijou || !this.imgRecto || !this.imgVerso) {
      const toast = await this.toastController.create({
        message: 'Veuillez prendre toutes les photos obligatoires',
        color: 'danger',
        duration: 2000
      });
      toast.present();
      return;
    }
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
        achat_id: this.id,
        titre: this.titre,
        poids: this.poids,
        amount: this.amount,
        supplier_name: this.supplier_name,
        pic_filename: this.imgBijouName,
        pic_cni_recto: this.imgRectoName,
        pic_cni_verso: this.imgVersoName
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

  takePicture(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 90,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    };
  
    this.camera.getPicture(options).then(imagePath => {
      const name = new Date().getTime() + '.jpg';
      this.uploadImage(imagePath, name);
    }).catch(err => {
      console.log('Annulé ou erreur', err);
    });
  }
  uploadImage(imagePath: string, fileName: string) {
    this.file.resolveLocalFilesystemUrl(imagePath).then((entry: any) => {
      entry.file(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const blob = new Blob([reader.result], { type: file.type });
          const formData = new FormData();
          formData.append('file', blob, fileName);
  
          this.http.post(
            'https://diantalmara.com/server_apidiantal/upload.php',
            formData
          ).subscribe((res: any) => {
            if (res.success) {
              const imgPath = this.webview.convertFileSrc(imagePath);
  
              if (this.currentType === 'bijou') {
                this.imgBijou = imgPath;
                this.imgBijouName = fileName;
              }
              if (this.currentType === 'recto') {
                this.imgRecto = imgPath;
                this.imgRectoName = fileName;
              }
              if (this.currentType === 'verso') {
                this.imgVerso = imgPath;
                this.imgVersoName = fileName;
              }
            }
          });
        };
        reader.readAsArrayBuffer(file);
      });
    });
  }

  async checkCameraPermission(): Promise<boolean> {
    const result = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.CAMERA
    );
  
    if (result.hasPermission) {
      return true;
    }
  
    const request = await this.androidPermissions.requestPermission(
      this.androidPermissions.PERMISSION.CAMERA
    );
  
    return request.hasPermission;
  }
  
  async checkGalleryPermission(): Promise<boolean> {
    // Android 13+
    const media = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES
    );
  
    if (media.hasPermission) {
      return true;
    }
  
    // Android <= 12
    const storage = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
    );
  
    if (storage.hasPermission) {
      return true;
    }
  
    const request = await this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES,
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
    ]);
  
    return request.hasPermission;
  }

}
