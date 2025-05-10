import { defineStore } from "pinia";

export const useElevatorsStore = defineStore("elevators", {
  state() {
    return {
      elevators: [
        {
          id: 1,
          name: "电梯1",
          sensor: {
            acceleration: 3,
            speed: 12,
            position: 10,
          },
          location: "安楼",
        },
        {
          id: 2,
          name: "电梯2",
          sensor: {
            acceleration: 0,
            speed: 20,
            position: 99,
          },
          location: "博楼",
        },
        {
          id: 3,
          name: "电梯3",
          sensor: {
            acceleration: 1,
            speed: 16,
            position: 2,
          },
          location: "安楼",
        },
        {
          id: 4,
          name: "电梯4",
          sensor: {
            acceleration: 13,
            speed: 50,
            position: 130,
          },
          location: "图书馆",
        },
        {
          id: 5,
          name: "电梯5",
          sensor: {
            acceleration: 20,
            speed: 42,
            position: 5,
          },
          location: "图书馆",
        },
      ],
      elevatorStatus: ["正常运行", "警告", "故障"],
    };
  },
  getters: {
    Status(state) {
      const status = ["", "", "", "", ""];
      state.elevators.forEach((e, index) => {
        if (e.sensor.speed <= 30 && e.sensor.acceleration <= 5 && e.sensor.position <= 12) {
          status[index] = state.elevatorStatus[0];
        } else if (e.sensor.speed > 30 && e.sensor.acceleration > 5 && e.sensor.position > 12) {
          status[index] = state.elevatorStatus[2];
        } else {
          status[index] = state.elevatorStatus[1];
        }
      });
      return status;
    },
  },
});

/*elevator-sensor-system/
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
└── tscondig.json */
