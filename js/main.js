function createElemWithText(elemType="p",textContent="",className){
	const myElem=document.createElement(elemType);
	myElem.textContent=textContent;
	if(className)
		myElem.classList.add(className);
	return myElem;
}
function createSelectOptions(jsonData){
	if(!jsonData) return undefined;
	var options=[];
	jsonData.forEach(function (user) { 
		const option=document.createElement("option");
		option.value=user.id;
		option.textContent=user.name;
		options.push(option);
	});
	return options;
}
function toggleCommentSection(postId){
	if(!postId)
		return undefined;	
	const section=document.querySelector(`section[data-post-id='${[postId]}']`);
	if(section){
		section.classList.toggle('hide');
		return section;
	}
	else
	{
		return null;
	}
}
function toggleCommentButton(postId) {
	if(!postId)
		return undefined;	
	const button=document.querySelector(`button[data-post-id='${[postId]}']`);
	if(button){
		if(button.textContent=="Show Comments")
			button.textContent="Hide Comments";
		else if(button.textContent=="Hide Comments")
			button.textContent="Show Comments";
		return button;
	}
	else
	{
		return null;
	}
}
function deleteChildElements(parentElement) {
	if(!parentElement)
		return undefined;
	if(!(parentElement instanceof Element))
		return undefined;
	var lastElement=parentElement.lastElementChild;
	while(lastElement){
		 parentElement.removeChild(lastElement);
		 lastElement=parentElement.lastElementChild;
	}
	return parentElement;
}
function addButtonListeners() {
	const buttons=document.querySelectorAll("main button");
	buttons.forEach(function(button){
		const postId=button.dataset.postId;
		if(postId){
			button.addEventListener("click", function(event){toggleComments(event,postId)});
		}
	});
	return buttons;
}
function removeButtonListeners() {
	const buttons=document.querySelectorAll("main button");
	buttons.forEach(function(button){
		const postId=button.dataset.postId;
		if(postId){
			button.removeEventListener("click", function(event){toggleComments(event,postId)});
		}
	});
	return buttons;
}
function createComments(jsonData) {
	if(!jsonData) return undefined;
	const fragmentElement=document.createDocumentFragment();
	jsonData.forEach(function (comment) { 
		const articleElement=document.createElement("article");
		const h3Element=createElemWithText('h3', comment.name);
		const p1Element=createElemWithText('p', comment.body);
		const p2Element=createElemWithText('p', `From: ${comment.email}`);
		articleElement.append(h3Element);
		articleElement.append(p1Element);
		articleElement.append(p2Element);
		fragmentElement.append(articleElement);
	});
	return fragmentElement;
}
function populateSelectMenu(jsonData) {
	if(!jsonData) return undefined;
	const selectMenu=document.querySelector(`select[id='selectMenu']`);
	const options=createSelectOptions(jsonData);
	options.forEach(function (option) { 
		selectMenu.append(option);
	});
	return selectMenu;
}
async function getUsers() {
	try {
		var url="https://jsonplaceholder.typicode.com/users";
		var response=await fetch(url);
		var userdata=await response.json();
		return userdata;
	}
	catch(err){
		return undefined;
	}
}
async function getUserPosts(userid) {
	if(!userid)
		return undefined;
	try {
		var url="https://jsonplaceholder.typicode.com/posts?userId="+userid;
		var response=await fetch(url);
		var postdata=await response.json();
		return postdata;
	}
	catch(err){
		return undefined;
	}
}
async function getUser(userid) {
	if(!userid)
		return undefined;
	try {
		var url="https://jsonplaceholder.typicode.com/users?id="+userid;
		var response=await fetch(url);
		var userdata=await response.json();
		return userdata[0];
	}
	catch(err){
		return undefined;
	}
}
async function getPostComments(postid) {
	if(!postid)
		return undefined;
	try {
		var url="https://jsonplaceholder.typicode.com/comments?postId="+postid;
		var response=await fetch(url);
		var commentdata=await response.json();
		return commentdata;
	}
	catch(err){
		return undefined;
	}
}
async function displayComments(postId) {
	if(!postId)
		return undefined;
	const section=document.createElement("section");
	section.dataset.postId=postId;
	section.classList.add("comments");
	section.classList.add("hide");
	var comments=await getPostComments(postId);
	var fragment=await createComments(comments);
	section.append(fragment);
	return section;
}
async function createPosts(jsonData) {
	if(!jsonData) return undefined;
	const fragmentElement=document.createDocumentFragment();
	for(var i=0;i<jsonData.length;i++)
	{
		const post=jsonData[i];
		const articleElement=document.createElement("article");
		const h2Element=createElemWithText('h2', post.title);
		const p1Element=createElemWithText('p', post.body);
		const p2Element=createElemWithText('p', `Post ID: ${post.id}`);
		var author=await getUser(post.userId);
		const p3Element=createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
		const p4Element=createElemWithText('p', `${author.company.catchPhrase}`);
		const buttonElement=createElemWithText('button', `Show Comments`);
		buttonElement.dataset.postId = post.id;
		articleElement.append(h2Element);
		articleElement.append(p1Element);
		articleElement.append(p2Element);
		articleElement.append(p3Element);
		articleElement.append(p4Element);
		articleElement.append(buttonElement);
		const section=await displayComments(post.id);
		articleElement.append(section);
		fragmentElement.append(articleElement);
	}
	return fragmentElement;
}
async function displayPosts(posts) {	
	const mainElement=document.querySelector(`main`);
	var element=undefined;
	if(posts){
		element =  await createPosts(posts);
	} else{
		const defaultParagraph=document.querySelector(`p[class='default-text']`);
		const defaultParagraphText=defaultParagraph.textContent;
		element=createElemWithText("p",defaultParagraphText);
		element.classList.add('default-text');
	}
	mainElement.append(element);
	return element;
}
function toggleComments(event,postId) {
	if(!event || !postId) return undefined;
	event.target.listener = true;
	const section=toggleCommentSection(postId);
	const button=toggleCommentButton(postId);
	return [section,button];
}
async function refreshPosts(jsonData) {
	if(!jsonData) return undefined;	
	const removeButtons=removeButtonListeners();
	const mainElement=document.querySelector(`main`);
	const main=deleteChildElements(mainElement);	
	const fragment=await displayPosts(jsonData);	
	const addButtons=addButtonListeners();
	return [removeButtons, main,fragment, addButtons];
}
async function selectMenuChangeEventHandler(event) {
	if(!event) return undefined;
	const selectMenu=document.querySelector(`select[id='selectMenu']`);
	selectMenu.disabled=true;
	var userId =1;
	if(event.target) 
	userId= event.target.value || 1;
	const posts=await getUserPosts(userId);
	const refreshPostsArray=await refreshPosts(posts);
	selectMenu.disabled=false;
	return [userId, posts, refreshPostsArray];
}
async function initPage() {
	const users=await getUsers();
	const select=populateSelectMenu(users);
	return  [users, select];
}
function initApp() {
	initPage();
	const selectMenu=document.querySelector(`select[id='selectMenu']`);
	selectMenu.addEventListener("change", function(event){selectMenuChangeEventHandler(event)});
}
document.addEventListener("DOMContentLoaded", function(e){initApp()});
