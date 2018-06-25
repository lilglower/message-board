import Controller from '@ember/controller';
import Ember from 'ember'

export default Controller.extend({
	ajax: Ember.inject.service(),
	loading : false,
	message : "Hello World!",
	key : "adam.fowler",
	endpoint : "http://167.99.111.228:4000/",
	error : null,
	change : null,
	form : {
		title : "",
		content : "",
		attachment : null
	},
	posts : [],
	init(){
		this.getPosts()
	},
	getPosts(){
		this.set('loading', true)
		return this.get('ajax').request(this.endpoint + 'posts', {
				method: 'GET',
				data: {key : this.get('key')}
			})
			.then(result => {
				this.set('posts', result.posts)
				this.set('loading', false)
			})
			.catch(e => {
				this.set('loading', false)
				this.handleError(e)
			})
	},
	modify(post){
		Ember.set(post, 'edit', !post.edit)
		this.set('change', Object.assign({}, post))
	},
	modifyPost(e){
		e.preventDefault()
		try{
			if(this.change.title == "")
				throw new Error("The post title is empty!")

			if(this.change.content == "")
				throw new Error("The post content is empty!")
		} catch(e){
			return this.handleError(e)
		}
		return this.readFile($("input[type='file']", e.target)[0], '')
			.then(contents => {
				Ember.set(this.change, 'attachment', contents)
				return this.deletePost(this.get('change'), false)
			})
			.then(() => {
				this.set('form', Object.assign({}, this.change))
				return this.handleSubmit(e)
			})

	},
	deletePost(post, doConfirm = true){
		if(doConfirm && !confirm("Are you sure you want to delete this post?"))
			return
		return this.get('ajax').request(this.endpoint + 'posts/' + post.id, {
				method: 'DELETE',
				data: {key : this.key}
			})
			.then(result => {
				return this.getPosts()
			})
			.catch(this.handleError)
	},
	handleSubmit(e){
		if(typeof e == 'object')
			e.preventDefault()
		try{
			if(this.form.title == "")
				throw new Error("The post title is empty!")

			if(this.form.content == "")
				throw new Error("The post content is empty!")
		} catch(e){
			return this.handleError(e)
		}
		this.set('loading', true)
		this.form.key = this.get('key')
		return this.readFile($('#uploadFile')[0], this.form.attachment)
			.then(fileContents => {
				Ember.set(this.form, 'attachment', fileContents)
				return this.get('ajax').request(this.endpoint + 'posts', {
					method: 'POST',
					data: {post : this.form}
				})
			})
			.then(result => {
				this.set('loading', false)
				return this.getPosts()
			})
			.then(() => {
				//reset form
				Ember.set(this.form, 'title', '')
				Ember.set(this.form, 'content', '')
				Ember.set(this.form, 'attachment', '')
				e.target.reset()
			})
			.catch(e => {
				this.set('loading', false)
				this.handleError(e)
			})
	},
	download(post){
		var uri = "data:application/octet-stream," + encodeURIComponent(post.attachment),
			newWindow = window.open(uri, 'attachment')
	},
	readFile(file, attachment){
		return new Promise((resolve, reject) => {
			if(attachment && attachment != '')
				return resolve(attachment)
			file = file.files[0]
			if(!file)
				return resolve("")
			var reader = new FileReader();
		    reader.readAsText(file, "UTF-8");
		    reader.onload = function (evt) {
		        resolve(evt.target.result)
		    }
		    reader.onerror = function (evt) {
		        reject(new Error(evt))
		    }
		})
	},
	handleError(e){
		this.set('error', e.toString())
	}
});
