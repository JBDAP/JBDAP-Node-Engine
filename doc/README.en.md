# JBDAP-Node-Engine Document

## **[中文版介绍请戳这里](https://github.com/JBDAP/JBDAP-Node-Engine/blob/master/README-CN.md)**

# 1. Introduction: 

**JBDAP-Node-Engine** is an official implementation (nodejs version) of **JBDAP**, it helps you to operate your relational database by defining a JSON object, it is simple, semantic, easy to use, and powerful, programmable, of course transaction-supported. If you prefer to go straight to the main point, then **[click here](#first)**, get yourself to the demo codes.

It doesn't matter if you know nothing about **JBDAP** for now, let's find out what **JBDAP-Node-Engine** can do first, then you will know whether it is your cup of tea.

- It is a data access helper by which you can operate almost any kind of common relational database such as mysql, postgresql, sqlserver, sqlite, oracle, etc. *(No big deal, isn't it)*

- You don't need to write annoying sqls any more. *(Still not refreshing, we can find tons of excellent ORM frameworks in Github)*

- You can manipulate your database by defining a single JSON object, and don't get me wrong, when i say manipulate, those being manipulated include not only simple CRUDs but also complex sets of operations with logic and transaction. *(Well, this sounds interesting)*

- Obviously, this is really suitable for building WebAPIs, frontend devices post a JSON to the backend and get what they want, very typical and smooth! The best part is, frontend developers can independently decide what data they send and what content in which format they expect to receive. Any time they need to change their requirements, which happens a lot, they just change the JSON on their own! No front-back-end communications (or fights), no backend coding adaptions, no api document updates, no application server redeployments... OMG, what a wonderful world! *(Is this for real?)*

- Why do i design it like this? Ask Restful! In my opinion, Restful is a typical well intentioned but badly practicable design. Enforcing Restful principle may cause following consequences: serious fragmentation of APIs, lack of data relation concern, too much coding for complicated logics, more and more URLs, being heavily dependent on API documents, tortures against both frontend and backend developers even if there was only a small requirement change, painful communications and joint debuggings, etc. Many frontend developers went nuts because of their backend colleague's 'Restful' APIs, meanwhile, backend developers were also disturbed and exhausted by frequent requirement changes. Seriously, i feel deep sympathy for both of the frontend and backend guys, and i believe in many cases the product manager is the one to be blamed :-) *(Yeah, you got me)*

Ok, enough of talking abstract features and ideas, it's time for demo show!


<div style="width:100%;height:20px;border:none;"></div>
<div id="first" style="width:100%;height:1px;border:none;"></div>

# 2. First Look:

## *(To Be Continued)*