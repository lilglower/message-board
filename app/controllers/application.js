//import Controller from '@ember/controller';
import Ember from 'ember'

export default Ember.Controller.extend({
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
		return this.deletePost(this.get('change'), false)
			.then(() => {
				this.set('form', Object.assign({}, this.change))
				return this.handleSubmit()
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
		return this.get('ajax').request(this.endpoint + 'posts', {
	      method: 'POST',
	      data: {post : this.form}
	    })
	    .then(result => {
	    	this.set('loading', false)
	    	return this.getPosts()
	    })
	    .then(() => {
	    	//reset form
	    	Ember.set(this.form, 'title', '')
	    	Ember.set(this.form, 'content', '')
	    })
	    .catch(e => {
	    	this.set('loading', false)
	    	this.handleError(e)
	    })
	},
	handleError(e){
		this.set('error', e.toString())
	}
});
