<script setup lang="ts">

import { Button } from 'vant';
import world from '@/world';

function test(){
  let s = world.test();
 // console.log(s);
  ///s['Walk (ID 4 variation 0)'].play();

  let pos = world.getPlayerPosition();
  pos.set( 40, 6, 0 );


}

function forword(){
  let s = world.test();
 // console.log(s);

  let pos = world.getPlayerPosition();
  pos.x += 1;


}
function backword(){
  let s = world.test();
 // console.log(s);

  let pos = world.getPlayerPosition();
  pos.x +=  -1;


}
</script>

<template>
<div>
<Button type="primary" @click="test">测试</Button>
<Button type="primary" @click="forword">前进</Button>
<Button type="primary" @click="backword">后退</Button>
</div>

</template>
