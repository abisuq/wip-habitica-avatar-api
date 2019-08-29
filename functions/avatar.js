const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()
const template = `<div class="avatar" style="width: 90px;height:90px;">
      <style>.character-sprites{position: relative;}.character-sprites span{position: absolute;}</style>
      <div class="character-sprites" style="width: 90px;height:90px;">
        <template v-for="(klass, item) in visualBuffs"><span v-if="data.stats.buffs[item]" :class="klass"></span
        ></template>
        <span :class="'hair_flower_' + data.preferences.hair.flower"></span
        ><template><span :class="['chair_' + data.preferences.chair ]"></span
          ><span :class="[getGearClass('back')]"></span><span :class="[skinClass]"></span
          ><span :class="[data.preferences.size + '_shirt_' + data.preferences.shirt]"></span
          ><span :class="['head_0']"></span
          ><span :class="[data.preferences.size + '_' + getGearClass('armor')]"></span
          ><span :class="[getGearClass('back_collar')]"></span
          ><template v-for="type in ['bangs', 'base', 'mustache', 'beard']"
            ><span
              :class="['hair_' + type + '_' + data.preferences.hair[type] + '_' + data.preferences.hair.color]"
            ></span
          ></template>
          <span :class="[getGearClass('body')]"></span><span :class="[getGearClass('eyewear')]"></span
          ><span :class="[getGearClass('head')]"></span
          ><span :class="[getGearClass('headAccessory')]"></span
          ><span :class="['hair_flower_' + data.preferences.hair.flower]"></span>
          <span  :class="[getGearClass('shield')]"></span
          ><span :class="[getGearClass('weapon')]"></span></template
        ><span class="zzz" v-if="data.preferences.sleep"></span
        >
      </div>
</div>`

exports.avatar = data => {
  const cmp = new Vue({
    data() {
      return { data }
    },
    template,
    computed: {
      visualBuffs() {
        return {
          snowball: 'snowman',
          spookySparkles: 'ghost',
          shinySeed: `avatar_floral_${this.data.stats.class}`,
          seafoam: 'seafoam_star',
        }
      },
      skinClass() {
        let baseClass = `skin_${this.data.preferences.skin}`
        return `${baseClass}${this.data.preferences.sleep ? '_sleep' : ''}`
      },
      costumeClass() {
        return this.data.preferences.costume ? 'costume' : 'equipped'
      },
    },
    methods: {
      getGearClass(gearType) {
        let result = this.data.items.gear[this.costumeClass][gearType]
        return result
      },
    },
  })
  return new Promise((resolve, reject) => {
    renderer.renderToString(cmp, (err, html) => {
      if (err) {
        return reject(err)
      }
      return resolve(html)
    })
  })
}
