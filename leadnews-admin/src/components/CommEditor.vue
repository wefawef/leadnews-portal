<template>
  <el-dialog ref="dialog" :title="getTitle()" :visible.sync="dialogFormVisible">
    <el-form :model="form" :rules="rules" ref="commForm">
      <template v-for="item in fileds">
        <el-form-item v-if="item.type=='input'" :label="item.label" :label-width="formLabelWidth" :prop="item.name">
          <el-input v-model="form[item.name]" :disabled="disable" :value="item.value" autocomplete="off" :placeholder="item.placeholder"></el-input>
        </el-form-item>
        <el-form-item v-if="item.type=='number'" :label="item.label" :label-width="formLabelWidth" :prop="item.name">
          <el-input-number v-model="form[item.name]" :disabled="disable" :step="1" :value="item.value"></el-input-number>
        </el-form-item>
        <el-form-item v-if="item.type=='select'" :label="item.label" :label-width="formLabelWidth" :prop="item.name">
          <el-select v-model="form[item.name]" :disabled="disable" :placeholder="item.placeholder" :value="item.value">
            <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="item.type=='radio'" :label="item.label" :label-width="formLabelWidth" :prop="item.name">
          <el-radio-group v-model="form[item.name]" :disabled="disable" :value="item.value">
            <el-radio v-for="opt in item.radios" :key="opt.value" :label="opt.value">{{opt.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button v-if="disable" @click="dialogFormVisible = false">关 闭</el-button>
      <el-button v-if="!disable" @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" v-if="!disable" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {updateData} from '@/api/common'
  import { saveSensitive, updateSensitive } from '@/api/sensitive'
  import { saveChannel, updateChannel } from '@/api/channel'
  export default {
    name: 'commn-editor',
    props: ['title', 'fileds','table','submitSuccess','submitApiType'],
    data() {
      return {
        disable:false,
        model:'add',
        dialogFormVisible:false,
        formLabelWidth: '80px',
        entry:{},
        form: {},
        rules:{}
      }
    },
    mounted(){
      this.refresh()
    },
    methods:{
      add : function(){
        this.dialogFormVisible=true
        this.entry = {}
        this.model = 'add'
        this.refresh()
      },
      edit : function(item){
        this.dialogFormVisible=true
        this.entry = item
        this.model = 'edit'
        this.refresh()
      },
      view : function(item){
        this.disable=true
        this.dialogFormVisible=true
        this.entry = item
        this.model = 'view'
        this.refresh()
      },
      getTitle : function(){
        return (this.model=='add'?'新增':(this.model=='view'?'查看':'修改'))+' - '+this.title
      },
      refresh : function(){
        // 初始化数据
        for(let i=0;i<this.fileds.length;i++){
          let tmp = this.fileds[i]
          if(tmp.rule){
            this.rules[tmp.name]=tmp.rule
          }
          // 是否有修改值entry，否则使用默认值
          let val = tmp.value
          if(this.entry&&this.entry[tmp.name]!=undefined){
            val = this.entry[tmp.name]
          }
          if(typeof val == 'boolean'){
            if(val) val =1;
            else val = 0;
          }
          this.$set(this.form,tmp.name,val)
        }
      },
      submit : function(){
        this.$refs['commForm'].validate((valid) => {
          if (valid) {
            let sets = []
            for(let k in this.form){
              if(this.form[k]){
                // 排除时间的修改
                if(this.model=='add'||(this.model=='edit'&&k.indexOf("_time")==-1)){
                  sets.push({filed:k,value:this.form[k]})
                }
              }
            }
            let param = {
              model:this.model,
              name:this.table,
              where:[{filed:'id',type:'eq',value:this.entry.id}],
              sets:sets
            }
            this.submitToBack(param)
          } else {
            return false;
          }
        });
      },
      async submitToBack(param){
        // 针对敏感词模块，改为实体传参
        if(this.submitApiType === 'sensitive'){
          let res
          if(this.model === 'add'){
            res = await saveSensitive({ id: null, sensitives: this.form['sensitives'], createdTime: null })
            const code = Number(res && res.code)
            if(code===201 || code===200){
              this.dialogFormVisible=false
              this.submitSuccess()
              this.$message({type:'success',message:(code===201?'创建成功':'操作成功')});
              return
            }
          }else if(this.model === 'edit'){
            res = await updateSensitive({ id: this.entry.id, sensitives: this.form['sensitives'], createdTime: this.entry.createdTime || null })
            const code = Number(res && res.code)
            if(code===200){
              this.dialogFormVisible=false
              this.submitSuccess()
              this.$message({type:'success',message:'操作成功'});
              return
            }
          }else{
            // view 不提交
            return
          }
          // 异常提示
          const code = Number(res && res.code)
          const msg = code===404 ? '未找到' : (res && (res.error_message || '操作失败'))
          this.$message({type:'error',message: msg});
          return
        }

        if(this.submitApiType === 'channel'){
          let entity = {
            id: this.entry && this.entry.id != undefined ? this.entry.id : null,
            name: this.form['name'],
            description: this.form['description'],
            isDefault: this.form['is_default']==1 || this.form['is_default']===true,
            status: this.form['status']==1 || this.form['status']===true,
            ord: this.form['ord'] || 0,
            createdTime: new Date()
          }
          let res
          if(this.model === 'add'){
            res = await saveChannel(entity)
            const code = Number(res && res.code)
            if(code===201 || code===200){
              this.dialogFormVisible=false
              this.submitSuccess()
              this.$message({type:'success',message:(code===201?'创建成功':'操作成功')});
              return
            }
          }else if(this.model === 'edit'){
            res = await updateChannel(entity)
            const code = Number(res && res.code)
            if(code===200){
              this.dialogFormVisible=false
              this.submitSuccess()
              this.$message({type:'success',message:'操作成功'});
              return
            }
          }else{
            return
          }
          const code = Number(res && res.code)
          const msg = code===404 ? '未找到' : (res && (res.error_message || '操作失败'))
          this.$message({type:'error',message: msg});
          return
        }

        // 默认通用接口
        let res = await updateData(param)
        if(res.code==0){
          this.dialogFormVisible=false
          this.submitSuccess()
          this.$message({type:'success',message:this.getTitle()+'操作成功！'});
        }else{
          this.$message({type:'error',message:res.error_message});
        }
      }
    }
  }
</script>


<style scoped>
 .el-form-item{
   margin: 20px 0;
   text-align: left;
 }
</style>
