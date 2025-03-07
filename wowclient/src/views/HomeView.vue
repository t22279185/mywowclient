<script setup lang="ts">

import { Button } from 'vant';

function test(){
  const container = document.getElementById( 'container' );

console.log("test()");
console.log(App);

}
</script>

<template>

<Button type="primary" @click="test">主要按钮</Button>
<Button type="success"  size="small">成功按钮</Button>
<Button type="default">默认按钮</Button>
<Button type="danger">危险按钮</Button>
<Button type="warning">警告按钮</Button>

</template>
