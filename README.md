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
	"type": "root",
	"children": ["    \n    ", {
		"type": "ul",
		"props": {
			"id": {
				"name": "id",
				"value": "main",
				"meta": {}
			}
		},
		"children": ["\n      ", {
			"type": "li",
			"props": {
				"class": {
					"name": "class",
					"value": "my-list",
					"meta": {}
				}
			},
			"children": ["\n            ", {
				"type": "h1",
				"props": {},
				"children": ["{a.name} -  {a.id}"]
			}, " \n            ", {
				"type": "ul",
				"props": {},
				"children": ["\n                ", {
					"type": "li",
					"props": {},
					"children": ["\n                 ", {
						"type": "b",
						"props": {},
						"children": ["{c.id}  {c.type}"]
					}, "  \n                "]
				}, "\n            "]
			}, "\n        "]
		}, "\n    "]
	}, "   "]
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
