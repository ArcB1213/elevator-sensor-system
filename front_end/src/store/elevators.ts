import { defineStore } from "pinia";
import type {Elevator} from "@/interface.ts";

export const useElevatorsStore = defineStore("elevators", {
  state: ():Elevator => ({
    id: -1,
    name: "",
    location: "",
    status: "",
    lastmaintenance: "",
  }),
});

/*
elevator-sensor-system/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ElevatorDetail.vue
│   │   ├── ElevatorList.vue
│   │   └── sign_in.vue
│   ├── pages/
│   │   ├── ElevatorInfo.vue
│   │   ├── BasicDetail.vue
│   │   ├── SensorDetail.vue
│   │   ├── HomePage.vue
│   │   └── SignOut.vue
│   ├── router/
│   │   └── index.ts
│   ├── store/
│   │   ├── elevators.ts
│   │   └── user.ts
│   ├── styles/
│   │   └── main.css
│   ├── App.vue
│   ├── main.ts
│   └── index.html
├── package.json
├── tscondig.json
└── webpack.config.js
 */
