<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-back-button default-href="/" slot="start" />
        <ion-title>{{ $t("Order details") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item lines="none">
          <ion-label>
            <h2>{{ order.customer?.name }}</h2>
            <p>{{ order.orderName ? order.orderName : order.orderId }}</p>
          </ion-label>
          <ion-badge v-if="order.placedDate" color="dark" slot="end">{{ moment.utc(order.placedDate).fromNow() }}</ion-badge>
        </ion-item>
      </ion-list>
      <ion-item v-if="order.customer?.phoneNumber">
        <ion-icon :icon="callOutline" slot="start" />
        <ion-label>{{ order.customer?.phoneNumber }}</ion-label>
        <ion-button
          fill="outline"
          slot="end"
          color="medium"
          @click="copyToClipboard(order.customer?.phoneNumber)"
        >
          {{ $t("Copy") }}
        </ion-button>
      </ion-item>
      <ion-item v-if="order.customer?.email" lines="none">
        <ion-icon :icon="mailOutline" slot="start" />
        <ion-label>{{ order.customer?.email }}</ion-label>
        <ion-button
          fill="outline"
          slot="end"
          color="medium"
          @click="copyToClipboard(order.customer?.email)"
        >
          {{ $t("Copy") }}
        </ion-button>
      </ion-item>
  
    <main>
      <ion-card v-for="(item, index) in getCurrentOrderPart()?.items" :key="index">
        <ProductListItem :item="item" />
        <ion-item lines="none" class="border-top">
          <ion-label>{{ $t("Reason") }}</ion-label>
          <ion-select multiple="false" v-model="item.reason">
            <ion-select-option v-for="reason in unfillableReason" :value="reason.id" :key="reason.id">{{ $t(reason.label) }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-card>

      <!-- TODO: implement functionality to change shipping address -->
      <!-- <ion-button expand="block" fill="outline" @click="shipToCustomer()">
        {{ $t("Ship to customer") }}
        <ion-icon :icon="sendOutline" slot="end" />
      </ion-button> -->

      <ion-button expand="block" color="danger" fill="outline" @click="updateOrder(order)">
        {{ $t("Reject Order") }}
      </ion-button>
    </main>  
    </ion-content>
  </ion-page>
</template>

<script>
import {
  alertController,
  IonBackButton,
  IonBadge,
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { mapGetters, useStore } from "vuex";
import {
  sendOutline,
  swapVerticalOutline,
  callOutline,
  mailOutline,
} from "ionicons/icons";
import ProductListItem from '@/components/ProductListItem.vue'
import { copyToClipboard } from '@/utils'
import { useRouter } from 'vue-router'
import * as moment from "moment-timezone";
import ShipToCustomerModal from "@/components/ShipToCustomerModal.vue";

export default defineComponent({
  name: "OrderDetail",
  props: ['orderId'],
  components: {
    IonBackButton,
    IonBadge,
    IonButton,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    ProductListItem
  },
  data () {
    return {
      unfillableReason: JSON.parse(process.env.VUE_APP_UNFILLABLE_REASONS)
    }
  },
  computed: {
    ...mapGetters({
      order: "order/getCurrent",
      currentFacility: 'user/getCurrentFacility',
    })
  },
  ionViewDidEnter() {
    if(this.order.items) this.order.items.map((item) => item['reason'] = this.unfillableReason[0].id);
  },
  methods: {
    async shipToCustomer() {
      const shipmodal = await modalController.create({
        component: ShipToCustomerModal,
      });
      return shipmodal.present();
    },
    async updateOrder (order) {
      const alert = await alertController
        .create({
          header: this.$t('Update Order'),
          message: this.$t(`This order will be removed from your dashboard. This action cannot be undone.`, { space: '<br /><br />' }),
          buttons: [{
            text: this.$t('Cancel'),
            role: 'cancel'
          },{
            text: this.$t('Reject Order'),
            handler: () => {
              this.store.dispatch('order/setUnfillableOrderOrItem', { orderId: order.orderId, parts: this.getCurrentOrderPart() }).then((resp) => {
                if (resp) this.router.push('/tabs/orders')
              })
            },
          }]
        });
      return alert.present();
    },
    async getOrderDetail(orderId, orderPartSeqId) {
      const payload = {
        facilityId: this.currentFacility.facilityId,
        orderId,
        orderPartSeqId
      }
      await this.store.dispatch("order/getOrderDetail", payload)
    },
    getCurrentOrderPart() {
      if (this.order.parts) {
        return this.order.parts.find((part) => part.orderPartSeqId === this.$route.params.orderPartSeqId)
      }
      return {}
    }
  },
  async mounted() {
    await this.getOrderDetail(this.$route.params.orderId, this.$route.params.orderPartSeqId);
  },
  setup () {
    const store = useStore();
    const router = useRouter();

    return {
      callOutline,
      copyToClipboard,
      mailOutline,
      moment,
      router,
      store,
      swapVerticalOutline,
      sendOutline
    };
  }
});
</script>

<style scoped>
main {
  max-width: 445px;
  margin: var(--spacer-base) auto 0; 
}

.border-top {
  border-top: 1px solid #ccc;
}
</style>
