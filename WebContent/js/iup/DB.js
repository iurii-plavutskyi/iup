if(typeof iup == "undefined") {
	iup = {};
}

if(typeof iup.db == "undefined") {
	iup.db = {};
}

iup.db.Connector = function(oCfg) {
	var cfg = {
		name : oCfg.name,
		//store : oCfg.store,
		onconnect : oCfg.onconnect,
		upgrade : oCfg.upgrade,
		version : oCfg.version || 1
	}
	
	var db;

	function init() {
		var request = indexedDB.open(cfg.name, cfg.version);
		request.onupgradeneeded = function() {
			db = request.result;
			if (typeof cfg.upgrade === "function") {
				cfg.upgrade(db);
			}
			
			console.log("onupgradeneeded", db);
		}
		request.onsuccess = function() {
			db = request.result;
			console.log("onsuccess", db);
			if (typeof cfg.onconnect === "function") {
				cfg.onconnect(db);
			}
		};
		request.onerror = function(event) {
			console.log("onerror", request.errorCode);
		};
	}
	
	init();

	function getObjectStore(store_name, mode) {
		var tx = db.transaction(store_name, mode);
		return tx.objectStore(store_name);
	}
	
	this.put = function (store, object, callback) {
//		var transaction = db.transaction([store], "readwrite");
		var store = getObjectStore(store, 'readwrite');
		var req;
		try {
			req = store.put(object);
			req.onsuccess = function(evt) {
				object.id = req.result;
				//console.log(req,evt,object.id);
				callback(object.id);
			}
			req.onerror = function () {
				console.log(req);
			}
			
		} catch (e) {
			
			throw e;
		}
	}
	
	this.get = function(store, id, callback) {
		var store = getObjectStore(store, 'readwrite');

		var req = store.get(key);
		req.onsuccess = function(evt) {
		    var record = evt.target.result;
		    console.log("record:", record);
			return record;
		}
	}
	
	this.list = function(store, callback, filter) {
		var store = getObjectStore(store, 'readonly');
		console.log(store);
		var cursorRequest = store.openCursor();
		 
		var items = [];
		 
		cursorRequest.onerror = function(error) {
			console.log(error);
		};
		 
		cursorRequest.onsuccess = function(evt) {                   
			var cursor = evt.target.result;
			if (cursor) {
				items.push(cursor.value);
				cursor.continue();
			} else {
				callback(items);
			}
		};	
			
		/*var index = store.index("by_author");
		var request = index.openCursor(IDBKeyRange.only("Fred"));
		request.onsuccess = function() {
			var cursor = request.result;
			if (cursor) {
			// Called for each matching record.
				console.log(cursor.value.isbn, cursor.value.title, cursor.value.author);
				cursor.continue();
			} else {
			// No more matching records.
				console.log(null);
			}
		};*/
	}
	
	this.remove = function(store, key) {
		console.log("delete:", arguments);

		var store = getObjectStore(store, 'readwrite');

    // As per spec http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
    // the result of the Object Store Deletion Operation algorithm is
    // undefined, so it's not possible to know if some records were actually
    // deleted by looking at the request result.
		var req = store.get(key);
		req.onsuccess = function(evt) {
		    var record = evt.target.result;
		    console.log("record:", record);
			if (typeof record == 'undefined') {
				console.log("No matching record found");
				return;
			}
		  // Warning: The exact same key used for creation needs to be passed for
		  // the deletion. If the key was a Number for creation, then it needs to
		  // be a Number for deletion.
			req = store.delete(key);
			req.onsuccess = function(evt) {
				console.log("evt:", evt);
				console.log("evt.target:", evt.target);
				console.log("evt.target.result:", evt.target.result);
				console.log("delete successful");
			};
			req.onerror = function (evt) {
				console.error("delete:", evt.target.errorCode);
			};
		};
		req.onerror = function (evt) {
			console.error("delete:", evt.target.errorCode);
		};
    }

	/*function readData() {

		var tx = db.transaction("books", "readonly");
		var store = tx.objectStore("books");
		var index = store.index("by_author");

		var request = index.openCursor(IDBKeyRange.only("Fred"));
		request.onsuccess = function() {
			var cursor = request.result;
			if (cursor) {
			// Called for each matching record.
				console.log(cursor.value.isbn, cursor.value.title, cursor.value.author);
				cursor.continue();
			} else {
			// No more matching records.
				console.log(null);
			}
		};
	}*/
}