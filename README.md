# AST to RenderFunction For Indo-Compiler


HTML:--

```html
   <ul id='main'>
      <li class='my-list'>
            <h1>{a.name} -  {a.id}</h1> 
            <ul>
                <li>
                 <b>{c.id}  {c.type}</b>  
                </li>
            </ul>
        </li>
    </ul> 
```
   
   
##AST:-

```bash
{
   "type":"root",
   "children":[
      {
         "type":"ul",
         "props":{
            "id":"main",
            "class":"mainList"
         },
         "children":[
            {
               "type":"li",
               "props":{
                  "class":"my-list"
               },
               "children":[
                  {
                     "type":"h1",
                     "props":{

                     },
                     "children":[
                        "{a.name} -  {a.id}"
                     ]
                  },
                  {
                     "type":"ul",
                     "props":{

                     },
                     "children":[
                        {
                           "type":"li",
                           "props":{

                           },
                           "children":[
                              {
                                 "type":"b",
                                 "props":{

                                 },
                                 "children":[
                                    "{c.id}  {c.type}"
                                 ]
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
}
```

##Render Function:-

```
render(
  "ul",
  { id: "main" },
  render(
    "li",
    { class: "my-list" },
    render("h1", null, a.name, " -  ", a.id),
    render(
      "ul",
      null,
      render(
        "li",
        null,
        render("b", null, c.id, "  ", c.type)
      )
    )
  )
);
``` 
