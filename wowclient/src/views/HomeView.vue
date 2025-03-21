<script setup lang="ts">

import { Button } from 'vant';
import world from '@/world';

function test(){
  let s = world.getActionlist();
 // console.log(s);
  ///s['Walk (ID 4 variation 0)'].play();
  s['Walkbackwards (ID 13 variation 0)'].stop();
  s['Walk (ID 4 variation 0)'].stop();
  let pos = world.getPlayerPosition();
  pos.set( 40, 6, 0 );


}

function forword(){
  let s = world.getActionlist();
  console.log(s);
  s['Walkbackwards (ID 13 variation 0)'].stop();
  s['Walk (ID 4 variation 0)'].play();

  let pos = world.getPlayerPosition();
  pos.x += 0.1;

}
function left(){
  let s = world.getActionlist();
 // console.log(s);

  let pos = world.getPlayerPosition();
  pos.z +=  - 0.1;


}
function right(){
  let s = world.getActionlist();
 // console.log(s);

  let pos = world.getPlayerPosition();
  pos.z +=   0.1;


}
function backword(){
  let s = world.getActionlist();
 // console.log(s);
 s['Walk (ID 4 variation 0)'].stop();
  s['Walkbackwards (ID 13 variation 0)'].play();

  let pos = world.getPlayerPosition();
  pos.x +=  - 0.1;


}


</script>

<template>
<div>
<Button type="primary" @click="test">测试</Button>
<Button type="primary" @mousedown="forword">前进</Button>
<Button type="primary" @click="left">左</Button>
<Button type="primary" @click="right">右</Button>
<Button type="primary" @click="backword">后退</Button>
</div>

</template>
