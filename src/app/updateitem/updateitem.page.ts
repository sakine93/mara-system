import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-updateitem',
  templateUrl: './updateitem.page.html',
  styleUrls: ['./updateitem.page.scss'],
})
export class UpdateitemPage implements OnInit {
  images: any[] = [];
  name: string = '';
  poids: string = '';
  imgtest: string = '';
  id: number;
  category: string = '';
  systeme_vente: string = '';
  type_or: string = '';
  quantity: number = 1;
  messerreur: string = '';

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
  ) {}

  ngOnInit() {
    this.loadStoredImages();
    this.setDefaultQuantity();
    this.actRoute.params.subscribe((data: any) => {
      this.id = data.id;
      this.type_or = data.type_or;
      this.name = data.name;
      this.category = data.category;
      this.systeme_vente = data.systeme_vente;
      this.poids = data.poids;

      this.images = [];
      this.imgtest = '';

      this.plt.ready().then(() => {
        this.loadStoredImages();
      });
    });
  }
  async checkPermissions() {
    // Camera permission
    const cam = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
    if (!cam.hasPermission) {
      await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
    }
  
    // READ_EXTERNAL_STORAGE (uniquement si on lit fichiers du téléphone)
    const storageRead = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
    if (!storageRead.hasPermission) {
      await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
    }
  }
  

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then((images) => {
      if (images) {
        const arr = JSON.parse(images);
        this.images = [];
        for (const img of arr) {
          const filePath = this.file.dataDirectory + img;
          const resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath });
        }
      }
    });
  }

  setDefaultQuantity() {
    if (this.systeme_vente !== 'poids') {
      this.quantity = 1;
    }
  }

  pathForImage(img: string) {
    return img ? this.webview.convertFileSrc(img) : '';
  }

  async selectImage() {
    //await this.checkPermissions();
    const actionSheet = await this.actionSheetController.create({
      header: "Veuillez choisir la photo de l'achat",
      buttons: [
        {
          text: 'Prendre une Photo',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        { text: 'Annuler', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 100,
      sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      allowEdit: false,
      targetHeight: 200,
      targetWidth: 200,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imagePath) => {
      const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
      this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
    });
  }

  copyFileToLocalDir(namePath: string, currentName: string, newFileName: string) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(() => {
      this.updateStoredImages(newFileName);
    }).catch(() => {
      this.presentToast('Erreur lors de l\'enregistrement du fichier');
    });
  }

  updateStoredImages(name: string) {
    this.storage.get(STORAGE_KEY).then((images) => {
      let arr = JSON.parse(images) || [];
      arr.push(name);
      this.storage.set(STORAGE_KEY, JSON.stringify(arr));

      const filePath = this.file.dataDirectory + name;
      const resPath = this.pathForImage(filePath);

      const newEntry = { name, path: resPath, filePath, imgtest: name };
      this.startUpload(newEntry);
      this.images = [newEntry];
      this.imgtest = name;
      this.ref.detectChanges();
    });
  }

  deleteImage(imgEntry: any, position: number) {
    this.images.splice(position, 1);
    this.storage.get(STORAGE_KEY).then((images) => {
      let arr = JSON.parse(images) || [];
      arr = arr.filter((name: string) => name !== imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(arr));

      const correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);
      this.file.removeFile(correctPath, imgEntry.name).then(() => {
        this.presentToast('Fichier supprimé.');
      });
    });
  }

  startUpload(imgEntry: any) {
    this.file.resolveLocalFilesystemUrl(imgEntry.filePath).then((entry: Entry) => {
      const fileEntry = entry as unknown as FileEntry;
      fileEntry.file((file) => this.readFile(file));
    }).catch(() => {
      this.presentToast('Erreur de lecture du fichier');
    });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result!], { type: file.type });
      formData.append('file', imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create();
    await loading.present();

    this.http.post("https://diantalmara.com/server_apidiantal/upload.php", formData)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe((res: any) => {
        if (res.success) {
          this.presentToast('Fichier téléchargé complètement');
        } else {
          this.presentToast('Échec du téléchargement du fichier');
        }
      });
  }

  async presentToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

  createFileName(): string {
    return new Date().getTime() + '.jpg';
  }

  async updateProsesItems(imgtest: string) {
    if (!this.poids || Number(this.poids) <= 0) {
      const toast = await this.toastController.create({
        message: 'Veuillez entrer un poids valide supérieur à 0 pour le bijou svp',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    const body = {
      aksi: 'updateitemss',
      item_id: this.id,
      poids: this.poids,
      quantity: this.quantity,
      pic_filename: imgtest,
    };

    this.postPvdr.postData(body, 'file_aksi.php').subscribe(async (data: any) => {
      const toast = await this.toastController.create({
        message: data.success ? 'Barcode mis à jour avec succès' : data.msg,
        duration: 1000,
        color: data.success ? 'success' : 'warning'
      });
      toast.present();

      if (data.success) this.router.navigate(['/barcodes']);
    });
  }
}
